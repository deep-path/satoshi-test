import { providers, transactions } from "near-api-js";
import { Action, SignedDelegate, SignedTransaction, buildDelegateAction, actionCreators, decodeTransaction } from '@near-js/transactions';
import { useEffect, useState, useCallback } from "react";

import { AccessKeyViewRaw, AccountView } from "near-api-js/lib/providers/provider";
import { KeyType, PublicKey } from "near-api-js/lib/utils/key_pair";
import { createTransaction, encodeDelegateAction, encodeTransaction, Signature } from "near-api-js/lib/transaction";
import { baseDecode, baseEncode } from '@near-js/utils';
import { verifySignature, verifyFullKeyBelongsToUser } from "@near-wallet-selector/core";
import { useNearWalletSelector } from '@/context/nearWalletSelectorContext'
import { calculateGasLimit } from 'btc-wallet'
import bs58 from 'bs58'
// @ts-ignore
import coinselect from 'coinselect';
import Big from "big.js";
import useToast from '@/hook/useToast'
import { computeNetworkFee, useBtcAction } from './useBtc'
import { sha256 } from 'js-sha256';
import { handleTransactionHash } from '@/util/transaction';


const { functionCall } = actionCreators;

import type {
    SignedMessage,
    SignMessageParams,
    Transaction,
} from "@near-wallet-selector/core";
import { base_url } from "@/config";
import { toHex } from "@/util";
import { useFeeRate } from "./useFeeRate";
import { number } from "bitcoinjs-lib/src/script";

const contractId = process.env.NEXT_PUBLIC_CONTRACT_ID
const token = process.env.NEXT_PUBLIC_TOKEN
const aBTCToken = '31761a152f1e96f966c041291644129144233b0b.factory.bridge.near';

const { signedDelegate, transfer } = actionCreators;

const THIRTY_TGAS = "300000000000000";
const NO_DEPOSIT = "0";

const net = (process.env.NEXT_PUBLIC_NEAR_NET || 'testnet') as any

export function getProvider() {
    const url = `https://rpc.${net}.near.org`;
    const provider = new providers.JsonRpcProvider({ url });

    return provider
}

export async function viewMethod({ method, args = {} }: {
    method: string,
    args: any
}) {
    const provider = getProvider()
    const res: any = await provider.query({
        request_type: "call_function",
        account_id: contractId,
        method_name: method,
        args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
        finality: "optimistic",
    });

    return JSON.parse(Buffer.from(res.result).toString());
};

export async function viewMethodAcc({ method, args = {} }: {
    method: string,
    args: any
}) {
    const provider = getProvider()
    const res: any = await provider.query({
        request_type: "call_function",
        account_id: process.env.NEXT_PUBLIC_ACCOUNT_CONTRACT_ID,
        method_name: method,
        args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
        finality: "optimistic",
    });

    return JSON.parse(Buffer.from(res.result).toString());
};

async function getAccountInfo(account: string) {
    const provider = getProvider()

    const res1: any = await provider.query({
        request_type: "call_function",
        // contractId: token,
        account_id: process.env.NEXT_PUBLIC_ACCOUNT_CONTRACT_ID,
        method_name: 'get_account',
        args_base64: Buffer.from(JSON.stringify({
            account_id: account
        })).toString("base64"),
        finality: "final",
    });

    const accountInfo = Buffer.from(res1.result).toString()

    if (accountInfo) {
        return JSON.parse(accountInfo)
    }

    return null
}

export async function getBalance(account: string, isABTC?: boolean) {
    const provider = getProvider()
    
    // Get the appropriate token based on isABTC flag
    const activeToken = isABTC ? aBTCToken : token

    const accountInfo = await getAccountInfo(account)

    if (accountInfo === 'null') {
        return '0'
    }
    const res: any = await provider.query({
        request_type: "call_function",
        account_id: activeToken,
        method_name: 'ft_balance_of',
        args_base64: Buffer.from(JSON.stringify({
            account_id: account
        })).toString("base64"),
        finality: "final",
    });

    const amount = Buffer.from(res.result).toString()

    const newAmount = amount.replace(/"/g, '')
    const decimals = isABTC ? 18 : 8
    return parseInt(newAmount) > 0 ? new Big(newAmount).div(10 ** decimals).toString() : '0'
}

export const checkTransactionStatus = (txHash: string, accountId: string) => {
    const provider = getProvider()
    return provider.txStatus(
        txHash,
        accountId
    );
};

function updateWithdraw(txHash: string) {
    return fetch(`${base_url}/receiveWithdrawMsg`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            txHash
        })
    }).then(res => res.json())
}

function uploadCAWithdraw(data: any) {
    return fetch(`${base_url}/receiveTransaction`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    }).then(res => res.json())
}

function getNonceFromApi(accountId: string) {
    return fetch(`${base_url}/nonce?csna=${accountId}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        },
    }).then(res => res.json())
}

function getNearNonceFromApi(accountId: string) {
    return fetch(`${base_url}/nonceNear?csna=${accountId}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        },
    }).then(res => res.json())
}

interface Props {
    account: string | null | undefined;
    updater: number;
    signMessage: any;
    transactionHook: any;
    isABTC?: boolean;
}


export const getTransactionStatus = (res: any): "failure" | "success" => {
    console.log('res', res)
    if (res?.status?.Failure) return "failure";
    if (res?.transaction_outcome?.outcome.status?.Failure) return "failure";
    const isFailure = res.transaction_outcome.outcome.status?.Failure;
    if (isFailure) return "failure";
    return "success";
};

export function useNearAction({
    account, updater, signMessage, transactionHook, isABTC
}: Props) {
    const [balance, setBalance] = useState<string | null>(null)
    const [metaData, setMetaData] = useState<any>({})
    // const [walletType, setWalletType] = useState<any>(null)
    const { context, walletType } = useNearWalletSelector()
    const { success, fail } = useToast()
    const { btcPublicKey } = useBtcAction({ updater: 1 })
    
    // Get the appropriate token based on isABTC flag
    const activeToken = isABTC ? aBTCToken : token

    // @ts-ignore
    const { feeRate } = useFeeRate()

    const verifyMessageBrowserWallet = useCallback(async (accountId: string) => {
        const { search } = window.location

        const searchParams = new URLSearchParams(search)


        const transactionHashes = searchParams.get('transactionHashes')
        console.log('transactionHashes', transactionHashes)
        if (transactionHashes) {
            const res: any = await handleTransactionHash(transactionHashes)

            console.log('res:---', res)

            const status = getTransactionStatus(res[res.length - 1].result)

            const txhash = Array.isArray(transactionHashes)
        ? transactionHashes
        : transactionHashes.split(",");

            // res && res.status && res.status.SuccessValue === 'bnVsbA=='
            if (status === 'success') {
                const result = await updateWithdraw(txhash[txhash.length - 1])
                if (result.result_code === 0) {
                    if (transactionHook) {
                        transactionHook(txhash[txhash.length - 1])
                    }
                    success({
                        title: 'Transaction success',
                        text: '',
                    })
                } else {
                    fail({
                        title: 'Transaction fail',
                        text: result.result_message
                    })
                }
            } else {
                fail({
                    title: 'Transaction fail',
                })
            }

            setTimeout(() => {
                // window.history.replaceState({}, document.title, url);

                const url = new URL(location.href);
                url.hash = "";
                url.search = "";

                const entries = searchParams.keys()
                let v, newPrams: any = {}
                while (!(v = entries.next()).done) {
                    if (v.value !== 'transactionHashes') {
                        newPrams[v.value] = searchParams.get(v.value)
                    }
                }

                const newUrl = Object.keys(newPrams).map(key => {
                    return `${key}=${newPrams[key]}`
                })

                window.history.replaceState(newPrams, document.title, `?${newUrl}`);
            }, 1000)

            return
        }

        const errorCode = searchParams.get('errorCode')
        const errorMessage = searchParams.get('errorMessage')
        if (errorCode || errorMessage) {
            fail({
                title: errorMessage ? decodeURIComponent(errorMessage) : 'Transaction failed',
            })

            setTimeout(() => {
                // window.history.replaceState({}, document.title, url);

                const url = new URL(location.href);
                url.hash = "";
                url.search = "";

                const entries = searchParams.keys()
                let v, newPrams: any = {}
                while (!(v = entries.next()).done) {
                    if (!(v.value === 'errorCode' || v.value === 'errorMessage')) {
                        newPrams[v.value] = searchParams.get(v.value)
                    }
                }

                const newUrl = Object.keys(newPrams).map(key => {
                    return `${key}=${newPrams[key]}`
                })

                window.history.replaceState(newPrams, document.title, `?${newUrl}`);
            }, 1000)
        }

    }, []);

    async function callMethod({ method, args = {} }: {
        method: string;
        args: any
    }) {
        const selectedWallet = await context.selector.wallet();
        try {
            const res = await selectedWallet.signAndSendTransaction({
                receiverId: activeToken,
                actions: [
                {
                    type: "FunctionCall",
                    params: {
                        methodName: method,
                        args,
                        gas: THIRTY_TGAS,
                        deposit: '1',
                    },
                },
            ],
        });

        console.log('res', res)
        localStorage.setItem('near_tx_simple', JSON.stringify(res))
        return res?.transaction
        } catch (e) {
            console.log('callMethod error:', e)
        }

        console.log('args:', args)
        if (walletType === 'my-near') {
            const selectedWallet = await context.selector.wallet();
            await selectedWallet.signAndSendTransaction({
                receiverId: activeToken,
                actions: [
                    {
                        type: "FunctionCall",
                        params: {
                            methodName: method,
                            args,
                            gas: THIRTY_TGAS,
                            deposit: '1',
                        },
                    },
                ],
            });
        } else if (walletType === 'ca') {
            const provider = getProvider()

            const { header } = await provider.block({ finality: 'final' });

            const accountId = account as string
            const publicKey = window.sessionStorage.getItem('ca-public-key') as string

            const rawAccessKey = await provider.query<AccessKeyViewRaw>({
                request_type: 'view_access_key',
                account_id: accountId,
                public_key: publicKey,
                finality: 'final'
            });

            const accessKey = {
                ...rawAccessKey,
                nonce: BigInt(rawAccessKey.nonce || 0)
            };

            console.log('accessKey:', accountId, publicKey, accessKey)

            const publicKeyFromat = PublicKey.from(publicKey)

            // const transaction = actions[0]

            // console.log('transaction:', functionCall(transaction.params.methodName, transaction.params.args, transaction.params.gas, transaction.params.deposit))

            // console.log('222', accessKey.nonce + BigInt(1))

            let nearNonceNumber = Number(accessKey.nonce + BigInt(1))
            const nearNonceApi = await getNearNonceFromApi(accountId)

            console.log('nearNonceApi:', nearNonceApi)

            if (nearNonceApi) {
                nearNonceNumber = Math.max(Number(nearNonceApi.result_data), Number(nearNonceNumber))
            }

            console.log('nearNonceNumber:', nearNonceNumber)

            const _transiton: any = await transactions.createTransaction(
                accountId,
                publicKeyFromat,
                activeToken as string,
                nearNonceNumber,
                // 0,
                [functionCall(method, args, BigInt(THIRTY_TGAS), BigInt(1))],
                baseDecode(header.hash)
            )

            console.log('_transiton:', _transiton)

            const tx_bytes = encodeTransaction(_transiton);

            const txHex = Array.from(tx_bytes, (byte) =>
                ('0' + (byte & 0xff).toString(16)).slice(-2),
            ).join('');

            const hash = bs58.encode(new Uint8Array(sha256.array(tx_bytes)));

            const accountInfo = await viewMethod({
                method: 'get_account',
                args: { 'account_id': accountId }
            })

            const nonceApi = await getNonceFromApi(accountId)

            console.log('accountInfo:', accountInfo, nonceApi)

            const nonce = Math.max(Number(nonceApi?.result_data), Number(accountInfo.nonce))

            console.log(nonce)

            const outcome = {
                near_transactions: Array.from(tx_bytes),
                nonce: Number(nonce),
                // nonce:0,
                chain_id: 397,
                csna: accountId,
                btcPublicKey,
                nearPublicKey: publicKey,
            } as any;

            // const outcome: any = await selectedWallet.signAndSendTransaction({
            //     receiverId: process.env.NEXT_PUBLIC_TOKEN,
            //     actions: [
            //         {
            //             type: "FunctionCall",
            //             params: {
            //                 methodName: method,
            //                 args,
            //                 gas: THIRTY_TGAS,
            //                 deposit: '1',
            //             },
            //         },
            //     ],
            // });

            const intention = {
                chain_id: outcome.chain_id.toString(),
                csna: outcome.csna,
                near_transactions: [txHex],
                // maximum_satoshi: "2648338",
                "gas_token": activeToken,
                "gas_limit": new Big(balance as string).mul(10 ** 8).toString(),
                nonce: (Number(outcome.nonce)).toString(),
            }

            console.log('intention:', intention)

            const strIntention = JSON.stringify(intention)

            const signature = await signMessage(strIntention)

            // const userIntention = {
            //     intention,
            //     btc_public_key: outcome.btcPublicKey,
            //     signature: signature
            // }

            // console.log('signature', signature)

            // console.log('userIntention:', JSON.stringify(userIntention))

            console.log('outcome:', outcome)

            const result = await uploadCAWithdraw({
                sig: signature,
                btcPubKey: outcome.btcPublicKey,
                data: toHex(strIntention),
                near_nonce: [Number(nearNonceNumber)]
                // pubKey: outcome.nearPublicKey,
            })

            console.log('result:', result)

            if (result.result_code === 0) {
                // success({
                //     title: 'Transaction success',
                //     text: '',
                // })
            } else {
                fail({
                    title: 'Transaction fail',
                    text: result.result_message
                })

                return ''
            }

            return {
                signature: toHex(signature),
                hash
            }
        }
    }

    async function callMethodSwap({transactions }: {
        transactions: any
    }) {

        const selectedWallet = await context.selector.wallet();
        const res = await selectedWallet.signAndSendTransactions({
          transactions
        });

        console.log('res', res)
        localStorage.setItem('near_tx', JSON.stringify(res))
        return res;
    }

    async function getMax(userSatoshis: string | number, btcAccount: string) {
        const allUTXO = await viewMethod({
            method: 'get_utxos_paged',
            args: {},
            // args: { from_index: 1, limit: 99 }
            // args: { from_index: 1, limit: 3 }
        })

        const utxos = Object.keys(allUTXO).map(key => {
            const txid = key.split('@')

            return {
                txid: txid[0],
                vout: allUTXO[key].vout,
                value: Number(allUTXO[key].balance),
                script: allUTXO[key].script,
            }
        })

        if (!utxos || utxos.length === 0) {
            return null
        }

        const { inputs, outputs, fee } = coinselect(
            utxos,
            [{ address: btcAccount, value: userSatoshis }],
            Math.ceil(100),
        );

        if (fee) {
            return Number(userSatoshis) - fee
        }
    }

    async function estimateGas(_satoshis: string | number, btcAccount: string) {
        let gasLimit: any = 0
        
        if (walletType === 'btc-wallet') {
            try {
                gasLimit = await calculateGasLimit({
                    env: (process.env.NEXT_PUBLIC_BTC_WALLET_NET || 'testnet') as any,
                    csna: account as string,
                    transactions: [{
                        receiverId: activeToken as string,
                        signerId: '',
                        actions: [
                            {
                                type: "FunctionCall",
                                params: {
                                    methodName: 'ft_transfer_call',
                                    args: {
                                        receiver_id: process.env.NEXT_PUBLIC_CONTRACT_ID,
                                        amount: '100',
                                        msg: ''
                                    },
                                    gas: THIRTY_TGAS,
                                    deposit: '1',
                                },
                            },
                        ],
                    }]
                })

                gasLimit = Number(gasLimit)
            } catch (e) {
                console.log('estimateGas error:', e)
            }
        }

        let satoshis = Number(_satoshis)

        console.log('gasLimit:', gasLimit)

        // const _balance = new Big(balance as string).mul(10 ** 8)
        if (gasLimit > 0) {
            satoshis = new Big(_satoshis).minus(gasLimit).toNumber()
        }

        let errorMsg = ''
        // get all UTXO
        const allUTXO = await viewMethod({
            method: 'get_utxos_paged',
            args: {},
            // args: { from_index: 1, limit: 99 }
            // args: { from_index: 1, limit: 3 }
        })

        const metaData = await viewMethod({
            method: 'get_config',
            args: {}
        })

        console.log('metaData:', metaData)

        const accountInfo = await getAccountInfo(account as string)

        console.log('accountInfo:', accountInfo)

        if (metaData.min_withdraw_amount) {
            if (Number(satoshis) < Number(metaData.min_withdraw_amount)) {
                return {
                    withdrawFee: 0,
                    isError: true,
                    errorMsg: 'Mini withdraw amount is ' + (Number(metaData.min_withdraw_amount) + Number(gasLimit)),
                }
            }
        }

        const feePercent = Number(metaData.withdraw_bridge_fee.fee_rate) * Number(satoshis)
        let withdrawFee = feePercent > Number(metaData.withdraw_bridge_fee.fee_min) ? feePercent : Number(metaData.withdraw_bridge_fee.fee_min)

        console.log('withdrawFee:', withdrawFee, account)

        const withdrawChangeAddress = metaData.change_address

        console.log('allUTXO:', allUTXO, withdrawFee)

        // const _utxos = await getUtxo()

        // console.log('_utxos:', _utxos)

        const utxos = Object.keys(allUTXO).map(key => {
            const txid = key.split('@')

            return {
                txid: txid[0],
                vout: allUTXO[key].vout,
                value: Number(allUTXO[key].balance),
                script: allUTXO[key].script,
            }
        }).filter(utxo => {
            return utxo.value > Number(metaData.min_change_amount)
        })


        if (!utxos || utxos.length === 0) {
            errorMsg = 'The network is busy, please try again later.'
            return {
                withdrawFee,
                isError: true,
                errorMsg,
            }
        }

        const userSatoshis = Number(satoshis)
        const maxBtcFee = Number(metaData.max_btc_gas_fee)

        // console.log(withdrawFee, _fee, extendFee, userSatoshis)

        console.log('feeRate:', feeRate, utxos)

        let { inputs, outputs, fee } = coinselect(
            utxos,
            [{ address: btcAccount, value: userSatoshis }],
            Math.ceil(feeRate),
        );

        console.log('inputs:', inputs)

        let newInputs = inputs, newOutputs = outputs, newFee = fee

        console.log('inputs:', inputs, outputs, fee, userSatoshis)

        let compute2 = false

        if (!outputs || !inputs) {
            // const { inputs, outputs, fee: _fee } = coinselect(
            //     utxos,
            //     [{ address: btcAccount, value: userSatoshis }],
            //     Math.ceil(0),
            // );

            // newInputs = inputs
            // newOutputs = outputs
            // newFee = fee
            // compute2 = true
        }


        if (!newOutputs || newOutputs.length === 0) {
            errorMsg = 'The network is busy, please try again later.'
            return {
                withdrawFee,
                isError: true,
                errorMsg,
            }
        }

        // return
        console.log('newFee: ', userSatoshis, newFee, newInputs, newOutputs.length, newOutputs)

        let userOutput, noUserOutput
        for (let i = 0; i < newOutputs.length; i++) {
            const output = newOutputs[i]
            if (output.value.toString() === (userSatoshis).toString()) {
                userOutput = output
            } else {
                noUserOutput = output
            }
            if (!output.address) {
                output.address = withdrawChangeAddress
            }
        }

        if (compute2) {
            // const maxfee = fee > maxBtcFee ? maxBtcFee : fee
            newFee = maxBtcFee
            if (userOutput.value < maxBtcFee) {
                errorMsg = 'Not enough gas'
                return {
                    gasFee: maxBtcFee,
                    withdrawFee,
                    isError: true,
                    errorMsg,
                }
            }
        }

        let dis = 0
        if (newFee > maxBtcFee) {
            dis = newFee - maxBtcFee
            newFee = maxBtcFee

            return {
                gasFee: newFee,
                withdrawFee,
                isError: true,
                errorMsg: 'Gas exceeds maximum value',
            }
        }

        userOutput.value = new Big(userOutput.value).minus(newFee).minus(withdrawFee).toNumber()

        if (userOutput.value < 0) {
            errorMsg = 'Not enough gas'
            return {
                gasFee: newFee,
                withdrawFee,
                isError: true,
                errorMsg,
            }
        }

        if (noUserOutput) {
            if (!noUserOutput.address) {
                noUserOutput.address = withdrawChangeAddress
            }
            if (!compute2) {
                noUserOutput.value = new Big(noUserOutput.value).plus(newFee).plus(withdrawFee).plus(dis).toNumber()
            } else {
                noUserOutput.value = new Big(noUserOutput.value).plus(withdrawFee).toNumber()
            }

        } else {
            if (!compute2) {
                noUserOutput = {
                    address: withdrawChangeAddress,
                    value: new Big(newFee).plus(withdrawFee).plus(dis).toNumber()
                }
            } else {
                noUserOutput = {
                    address: withdrawChangeAddress,
                    value: new Big(withdrawFee).toNumber()
                }
            }

            newOutputs.push(noUserOutput)
        }

        let minValue = Math.min.apply(null, newInputs.map((input: any) => input.value))
        let totalNoUserOutputValue = noUserOutput.value

        console.log('userOutput', totalNoUserOutputValue, minValue)

        while (totalNoUserOutputValue >= minValue && minValue > 0 && newInputs.length > 0) {
            totalNoUserOutputValue -= minValue
            noUserOutput.value = totalNoUserOutputValue
            const minValueIndex = newInputs.findIndex((input: any) => input.value === minValue)
            if (minValueIndex > -1) {
                newInputs.splice(minValueIndex, 1)
            }
            minValue = Math.min.apply(null, newInputs.map((input: any) => input.value))
        }

        let gasMore = 0
        if (noUserOutput.value === 0) {
            newOutputs = newOutputs.filter((item: any) => item.value !== 0)
        } else if (noUserOutput.value < Number(metaData.min_change_amount)) {
            gasMore = Number(metaData.min_change_amount) - noUserOutput.value
            userOutput.value -= gasMore
            noUserOutput.value = Number(metaData.min_change_amount)
        }

        console.log('newOutputs:', newOutputs, 'gasMore:', gasMore)

        const insufficientOutput = newOutputs.some((item: any) => item.value < 0)

        if (insufficientOutput) {
            errorMsg = 'Not enough gas'
            return {
                gasFee: newFee,
                withdrawFee,
                isError: true,
                errorMsg,
            }
        }

        console.log('inputs-outputs', newFee, newInputs, newOutputs)

        const inputSum = newInputs.reduce((sum: any, cur: any) => { return sum + Number(cur.value) }, 0)
        const outputSum = newOutputs.reduce((sum: any, cur: any) => { return sum + Number(cur.value) }, 0)
        const decimals = isABTC ? 18 : 8
        if (newFee + outputSum !== inputSum) {
            console.log('error', inputSum, newFee, outputSum, gasMore)
            return {
                withdrawFee,
                isError: true,
                errorMsg: 'Service busy, please try again later',
            }
        }

        return {
            withdrawFee: new Big(withdrawFee).plus(gasLimit).plus(gasMore).toNumber(),
            gasFee: new Big(newFee).toNumber(),
            inputs: newInputs,
            outputs: newOutputs,
            fromAmount: satoshis,
            receiveAmount: new Big(userOutput.value).div(10 ** 8).toString(),
            isError: false,
            errorMsg,
        }
    }

    useEffect(() => {
        if (!account) {
            setBalance('')
            return
        }
        getBalance(account, isABTC).then(res => {
            if (new Big(res).gt(new Big(0.0000001))) {
                setBalance(res)
            } else {
                setBalance('0')
            }
        })

        viewMethod({
            method: 'get_config',
            args: {}
        }).then((metaData) => {
            setMetaData(metaData)
        })

        const inter = setInterval(() => {
            if (account) {
                getBalance(account, isABTC).then(res => {
                    if (new Big(res).gt(new Big(0.0000001))) {
                        setBalance(res)
                    } else {
                        setBalance('0')
                    }
                })
            }
        }, 10000)

        return () => {
            clearInterval(inter)
        }

    }, [updater, account, activeToken])

    useEffect(() => {
        console.log('account', account)
        const timeoutId = setTimeout(() => {
            if (account) {
                verifyMessageBrowserWallet(account);
            }
        }, 500);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [account])

    // useEffect(() => {
    //     async function getWalletType() {
    //         try {
    //             const selectedWallet = await context.selector.wallet();
    //             if (selectedWallet.id === 'ca-wallet') {
    //                 setWalletType('ca')
    //             } else if (selectedWallet.id === 'my-near-wallet') {
    //                 setWalletType('my-near')
    //             }
    //         } catch(e) {
    //             console.log(e)
    //         }
    //     }

    //     if (context) {
    //         getWalletType()
    //     }
    // }, [context])

    return {
        viewMethod,
        viewMethodAcc,
        getBalance,
        balance,
        callMethod,
        estimateGas,
        walletType,
        metaData,
        getMax,
        callMethodSwap
    }
}