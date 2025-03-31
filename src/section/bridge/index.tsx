"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import Big from 'big.js'
import * as bitcoin from 'bitcoinjs-lib';

import styles from './bridge.module.css'
import Header from './header'
import TokenInput from './tokenInput'
import Swap from './swap'
import DestinationAddress from './destinationAddress'
import Fee from './feeDetail'
import Btn from '@/component/btn'
import useAccount, { isBtc, isNear } from '@/hook/useAccount'
import { useBtcAction } from '@/hook/useBtc'
import { useNearAction } from '@/hook/useNear'
import useToast from '@/hook/useToast'
import chains from '@/util/chains'
import ConfirmBox from './confirmBox'
import useStatus from './hooks/useStatus';
import { useFeeRate } from '@/hook/useFeeRate';
import { executeBTCDepositAndAction } from 'btc-wallet'
import ecc from '@bitcoinerlab/secp256k1';
import { usePrice } from '@/hook/usePrice';
import { getBitcoinAddressType } from '@/util';
import { getProvider } from '@/hook/useNear';
import { FinalExecutionOutcome, QueryResponseKind } from 'near-api-js/lib/providers/provider';
import request from '@/util/request';
import { type FunctionCallAction, type Transaction } from '@near-wallet-selector/core';
import { parseAmount, formatAmount, safeJSONParse,generateUrl, uint8ArrayToHex } from '@/util/formatter';
import { QuerySwapParams, NearQuerySwapResponse } from '@/util/bridgeType';

bitcoin.initEccLib(ecc)


const time = 20
const THIRTY_TGAS = "300000000000000";
const btcConfig = {
    name: 'BTC',
    rpcEndpoint: process.env.NEXT_PUBLIC_BTC_NET === 'testnet' ? `https://blockstream.info/testnet/api/`: `https://blockstream.info/api/`,
    scanUrl: process.env.NEXT_PUBLIC_BTC_NET === 'testnet' ? 'https://blockstream.info/testnet' : 'https://blockstream.info',
}
const NBTC_ADDRESS = process.env.NEXT_PUBLIC_TOKEN
const ABTC_ADDRESS = '31761a152f1e96f966c041291644129144233b0b.factory.bridge.near'


  

// console.log(new BigNumber('0x6a42fc8d3b6000').toString())

export default function Bridge() {
    const [fromChain, setFromChain] = useState(window.location.href.indexOf('NEAR') > -1 ? chains.near : chains.btc)
    const [toChain, setToChain] = useState(chains.btc)
    const [fromAddress, setFromAddress] = useState<string | null>(null)
    const [toAddress, setToAddress] = useState<string | null>(null)
    const [enableDestiAddress, setEnableDestiAddress] = useState(false)
    const [destiAddress, setDestiAddress] = useState('')
    const [fromAmount, setFromAmount] = useState('')
    const [toAmount, setToAmount] = useState('')
    const [toBtcAmount, setToBtcAmount] = useState('')
    const [fromBalance, setFromBalance] = useState<string | null>(null)
    const [toBalance, setToBalance] = useState<string | null>(null)
    const { walletType, changeWalletType, login, logout, nearLogin, nearLogout, btcLogin, btcLogout, account, nearAccount, btcAccount } = useAccount()
    const [gasFee, setGasFee] = useState<number | null>(null)
    const [tradingFee, setTradingFee] = useState<number | null>(null)
    const [tradingTime, setTradingTime] = useState<number | null>(null)
    const [isError, setIsError] = useState<boolean>(false)
    const [errorMsg, setErrorMsg] = useState<string>('')
    const [estimateUpdater, setEstimateUpdater] = useState<number>(1)
    const estimateUpdaterRef = useRef<number>(1)
    const [comfirmShow, setComfirmShow] = useState<boolean>(false)
    const [comfirmStatus, setComfirmStatus] = useState<number>(0)
    const [comfirmHash, setcomfirmHash] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [destiAddressValid, setDestiAddressValid] = useState(false)
    const [signature, setSignature] = useState('')
    const [fromAmountMuiusFee, setFromAmountMuiusFee] = useState('')
    const [selectedToken, setSelectedToken] = useState('BTC')

    // @ts-ignore
    const { feeRate } = useFeeRate()
    // @ts-ignore
    const { prices } = usePrice()

    const [fromHash, setFromHash] = useState<any>('')
    const [fromChanId, setFromChanId] = useState<any>('')
    const { isSuccess } = useStatus({
        hash: fromHash,
        chainId: fromChanId,
        signature,
    })

    const nBtcInOut = useRef<any>(null)

    const { sendBitcoin, balance: btcBalance, estimateGas: estimateBtcGas, receiveDepositMsg, receivePreDepositMsg, getUtxo, btcPublicKey, signMessage, getMax: getBtcMax } = useBtcAction({
        updater: 1
    })
    const { viewMethod, viewMethodAcc, callMethod, callMethodSwap, balance: nearBalance, estimateGas: estimateNearGas, walletType: nearWalletType, metaData, getMax: getNearMax } = useNearAction({
        account: nearAccount,
        updater: 1,
        signMessage,
        transactionHook: (val: string) => {
            setcomfirmHash(val)
            setComfirmShow(true)
            setComfirmStatus(0)

            setFromHash(val)
            setSignature('')
            setFromChanId(2)
        },
        isABTC: selectedToken === 'aBTC'
    })

    const { success, fail } = useToast()

    const fromLogin = useCallback(() => {
        if (isNear(fromChain)) {
            nearLogin()
        } else if (isBtc(fromChain)) {
            btcLogin()
        }
    }, [fromChain, nearLogin, btcLogin])

    const fromLogout = useCallback(() => {
        if (isNear(fromChain)) {
            nearLogout()
        } else if (isBtc(fromChain)) {
            btcLogout()
        }
    }, [fromChain, nearLogout, btcLogout])

    const toLogin = useCallback(() => {
        if (isNear(toChain)) {
            nearLogin()
        } else if (isBtc(toChain)) {
            btcLogin()
        }
    }, [toChain, nearLogin, btcLogin])

    const toLogout = useCallback(() => {
        if (isNear(toChain)) {
            nearLogout()
        } else if (isBtc(toChain)) {
            btcLogout()
        }
    }, [toChain, nearLogout, btcLogout])

    useEffect(() => {
        if (isSuccess) {
            setComfirmStatus(1)
        } else {
            setComfirmStatus(0)
        }
    }, [isSuccess])


    const query = async <T = any>({
        contractId,
        method,
        args = {},
        network,
      }: {
        contractId: string;
        method: string;
        args?: any;
        gas?: string;
        deposit?: string;
        network?: string;
      }) => {
        try {
          if (typeof window === 'undefined') return;
          const provider = getProvider()
          // console.log(`${method} args`, args);
          const res = await provider.query({
            request_type: 'call_function',
            account_id: contractId,
            method_name: method,
            args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
            finality: 'final',
          });
          const result = JSON.parse(
            Buffer.from((res as QueryResponseKind & { result: number[] }).result).toString(),
          ) as T;
          // console.log(`${method} ${contractId} result`, result);
          return result;
        } catch (error) {
          console.error(`${method} error`, error);
        }
      }
    

    const querySwap = async ({
        tokenIn,
        tokenOut,
        amountIn,
        pathDeep = 3,
        slippage = 0.005,
        routerCount,
        tokenInDecimals,
        tokenOutDecimals
      }: QuerySwapParams)=> {
        if (new Big(amountIn).eq(0)) return { amountIn: 0, amountOut: 0, minAmountOut: 0 };
        // const { tokenMeta } = useTokenStore.getState();
        const parsedAmountIn = parseAmount(amountIn, tokenInDecimals);
        const { result_data } = await request<{ result_data: NearQuerySwapResponse }>(
          generateUrl(`https://smartrouter.ref.finance/findPath`, {
            tokenIn,
            tokenOut,
            amountIn: parsedAmountIn,
            pathDeep,
            slippage,
            routerCount,
          }),
          { cacheTimeout: 3000 },
        );
        const amountOut = formatAmount(result_data.amount_out || 0, tokenOutDecimals);
        const minAmountOut = new Big(amountOut).times(1 - slippage).toString();
        return {
          ...result_data,
          amountIn,
          amountOut,
          minAmountOut,
        };
      }


  const generateTransaction = async ({
    tokenIn,
    tokenOut,
    amountIn,
    pathDeep = 3,
    slippage = 0.005,
    routerCount,
    decimals = 18,
  }: any) => {
    console.log(tokenIn, tokenOut, amountIn)
    const parsedAmountIn = parseAmount(amountIn, decimals);
    console.log(parsedAmountIn, 'parsedAmountIn')
    const {
      result_data: { methodName, args, gas },
    } = await request<{ result_data: FunctionCallAction['params'] }>(
      generateUrl(`https://smartrouter.ref.finance/swapPath`, {
        tokenIn,
        tokenOut,
        amountIn: parsedAmountIn,
        pathDeep,
        slippage,
      }),
    );
    const parsedMsg = safeJSONParse<any>((args as any).msg);
    if (!parsedMsg?.actions.length) throw new Error('No swap path found');
   
    const newArgs = { ...args, msg: JSON.stringify(parsedMsg) };
    return {
      methodName,
      gas,
      deposit: '1',
      args: { ...newArgs, receiver_id:'v2.ref-finance.near' },
    };
  } 


  const registerToken = async (token: string, recipient?: string) => {
    const accountId = nearAccount;
    const res = await query<{
      available: string;
      total: string;
    }>({
      contractId: token,
      method: 'storage_balance_of',
      args: { account_id: recipient || accountId },
    });
    console.log('checkFTStorageBalance', token, res);
    if (!res?.available) {
      return {
        receiverId: token,
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: 'storage_deposit',
              args: {
                account_id: recipient || accountId,
                registration_only: true,
              },
              deposit: '1250000000000000000000',
              gas: parseAmount(100, 12),
            },
          },
        ],
      } as any;
    }
  }

    const handleBtc = async () => {
        
        if (!nearWalletType) {
            throw 'No near wallet selected'
        }

        const account_id = enableDestiAddress ? destiAddress : nearAccount

        if (!account_id) {
            fail({
                title: 'Need near account'
            })
            return
        }

        if (!btcAccount) {
            fail({
                title: 'Need btc account'
            })
            return
        }

        let btnTempAddress

        const params: any = {}
        const _fromAmount = Number(new Big(fromAmount).mul(10 ** 8).toFixed(0))

        console.log('nearWalletType:', nearWalletType, fromAmount)

        if (nearWalletType === 'btc-wallet') {
            setIsLoading(true)

            
            // Generate swap transaction
            const action = await generateTransaction({
                tokenIn: NBTC_ADDRESS,
                tokenOut: ABTC_ADDRESS,
                amountIn: new Big(fromAmount).minus(2000 / 10 ** 8).toString(),
                decimals: 8,
            });

            // Check if token registration is needed
            const baseRegisterTransaction = await registerToken(ABTC_ADDRESS);
            
            if (baseRegisterTransaction) {
                // Execute registration and swap in one transaction
                const hash: any = await executeBTCDepositAndAction({
                    amount: _fromAmount.toString(),
                    env: (process.env.NEXT_PUBLIC_BTC_WALLET_NET || 'testnet') as any,
                    feeRate,
                    pollResult: false,
                    newAccountMinDepositAmount: false,
                    action: {
                        receiver_id: baseRegisterTransaction.receiverId,
                        amount: new Big(_fromAmount).minus(2000).toString(), 
                        msg: JSON.stringify({
                            actions: [
                                // First action: register token
                                baseRegisterTransaction.actions[0].params,
                                // Second action: swap
                                {
                                    receiver_id: 'v2.ref-finance.near',
                                    amount: new Big(_fromAmount).minus(2000).toString(),
                                    msg: action.args.msg,
                                }
                            ]
                        })
                    },
                });
                
                console.log('Hash with registration:', hash);
                return hash || null;
            } else {
                // Execute only swap transaction
                const hash: any = await executeBTCDepositAndAction({
                    amount: _fromAmount.toString(),
                    env: (process.env.NEXT_PUBLIC_BTC_WALLET_NET || 'testnet') as any,
                    feeRate,
                    pollResult: false,
                    newAccountMinDepositAmount: false,
                    action: {
                        receiver_id: 'v2.ref-finance.near',
                        amount: new Big(_fromAmount).minus(2000).toString(),
                        msg: action.args.msg,
                    },
                });
                
                console.log('Hash without registration:', hash);
                return hash || null;
            }
        } else {
            // const querySwapRes = await querySwap({
            //     tokenIn: NBTC_ADDRESS || 'nbtc.bridge.near',
            //     tokenOut: ABTC_ADDRESS,
            //     amountIn: _fromAmount.toString(),
            //     tokenInDecimals: 8,
            //     tokenOutDecimals: 18,
            // })
            // const satoshis = Math.floor((querySwapRes as any).min_amount_out)
            console.log(fromAmount, 2000 / 10 ** 8, new Big(fromAmount).minus(2000 / 10 ** 8).toNumber(), 'fromAmount')
            const action = await generateTransaction({
                tokenIn: NBTC_ADDRESS,
                tokenOut: ABTC_ADDRESS,
                amountIn: new Big(fromAmount).minus(2000 / 10 ** 8).toString(),
                decimals: 8,
              });
            const depositMsg: any = {
                recipient_id: nearAccount,
                post_actions: [{
                    receiver_id: 'v2.ref-finance.near',
                    amount: new Big(_fromAmount).minus(2000).toString(),
                    msg: action.args.msg,
                    gas: "50000000000000",
                }],
                extra_msg: undefined,
              };
           
            console.log(depositMsg, action, '2333')
            setIsLoading(true)
            btnTempAddress = await viewMethod({
                method: 'get_user_deposit_address',
                args: {
                    deposit_msg: depositMsg
                
                }
            })
            params.nearAddress = nearAccount
            params.depositType = 1
            params.postActions = JSON.stringify([{
                receiver_id: 'v2.ref-finance.near',
                amount: new Big(_fromAmount).minus(2000).toString(),
                msg: action.args.msg,
                gas: "50000000000000",
            }])
            params.extraMsg = undefined
        }

        await receivePreDepositMsg(params)
        
        setIsLoading(false)
       

        const hash = await sendBitcoin(btnTempAddress, _fromAmount, {
            feeRate
        })

        params.txHash = hash

        const result = await receiveDepositMsg(params)

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
        }

        console.log('hash', hash)
        setIsLoading(false)
        return hash
    }

    const handleNear = async () => {
        // abtc
        if (selectedToken === 'aBTC') {
            setIsLoading(true)
            const accountId = nearAccount
            // First query the swap to get expected output amount
            const querySwapRes = await querySwap({
                tokenIn: ABTC_ADDRESS,
                tokenOut: NBTC_ADDRESS || 'nbtc.bridge.near',
                amountIn: fromAmount,
                tokenInDecimals: 18,
                tokenOutDecimals: 8,
            })
            
            console.log('querySwapRes:', querySwapRes)
            
            // Generate the swap transaction
            const transaction = await generateTransaction({
                tokenIn: ABTC_ADDRESS,
                tokenOut: NBTC_ADDRESS || 'nbtc.bridge.near',
                amountIn: fromAmount,
            });
            
            const baseRegisterTransaction = await registerToken(ABTC_ADDRESS);
            const quoteRegisterTransaction = await registerToken(NBTC_ADDRESS || 'nbtc.bridge.near');
            const satoshis = (querySwapRes as any).amount_out
            const account_id = enableDestiAddress ? destiAddress : btcAccount;
            console.log('satoshis:', satoshis, account_id as string)
            const estimateResult = await estimateNearGas(Number(satoshis), account_id as string);
            console.log('estimateResult:520', estimateResult)
            if (!estimateResult || estimateResult.isError) {
                setIsLoading(false);
                setIsError(true);
                setErrorMsg(estimateResult?.errorMsg || 'Failed to estimate transaction');
                return null;
            }
            
            nBtcInOut.current = {
                inputs: estimateResult.inputs,
                outputs: estimateResult.outputs,
            };
            
            if (isError || !nBtcInOut.current) {
                setIsLoading(false);
                return null;
            }
            
            const { inputs, outputs } = nBtcInOut.current;
            console.log('inputs:', inputs, outputs);
            
            const network = process.env.NEXT_PUBLIC_BTC_NET === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
            const psbt = new bitcoin.Psbt({ network });
            
            for (let i = 0; i < inputs.length; i++) {
                const input = inputs[i];
                const txData = await fetch(`${btcConfig.rpcEndpoint}tx/${input.txid}`).then(res => res.json());
                
                const inputOptions = {
                    hash: input.txid,
                    index: input.vout,
                    sequence: 0xfffffffd,
                    witnessUtxo: {
                        script: Buffer.from(txData.vout[input.vout].scriptpubkey, 'hex'),
                        value: input.value
                    }
                };
                
                psbt.addInput(inputOptions);
            }
            
            outputs.forEach((output: { address: string; value: any }) => {
                if (!output.address) {
                    output.address = toAddress as string;
                }
                psbt.addOutput({
                    address: output.address,
                    value: output.value,
                });
            });
            
            const _inputs = inputs.map((item: any) => {
                return `${item.txid}:${item.vout}`;
            });
            
            const txOutputs = psbt.txOutputs.map((item: any) => {
                return {
                    script_pubkey: uint8ArrayToHex(item.script),
                    value: item.value
                };
            });
            
            console.log('txOutputs:', txOutputs);
            
            const msg = {
                Withdraw: {
                    target_btc_address: btcAccount,
                    input: _inputs,
                    output: txOutputs,
                }
            };
            
            const msgStr = JSON.stringify(msg);
            console.log('msgStr:', msgStr);
            
            // Prepare the transactions array
            const transactions: any = [];
            
            if (baseRegisterTransaction) {
                transactions.push(baseRegisterTransaction);
            }
            if (quoteRegisterTransaction) {
                transactions.push(quoteRegisterTransaction);
            }
            
            // Add the swap transaction
            transactions.push({
                signerId: accountId,
                receiverId: ABTC_ADDRESS,
                actions: [
                    {
                        type: 'FunctionCall',
                        params: transaction,
                    },
                ],
            });
            
            // Add the transfer transaction
            transactions.push({
                receiverId: NBTC_ADDRESS,
                actions: [
                    {
                        type: "FunctionCall",
                        params: {
                            methodName: 'ft_transfer_call',
                            args: {
                                receiver_id: process.env.NEXT_PUBLIC_CONTRACT_ID,
                                amount: satoshis.toString(),
                                msg: msgStr
                            },
                            gas: THIRTY_TGAS,
                            deposit: '1',
                        },
                    },
                ],
            });
            
            const res: any = await callMethodSwap({
                transactions
            });
            
            console.log('res:', res);
            setIsLoading(false);
            return res;
        } else {
            handleNearOrigin()
        }
    }

    const handleBtcOrigin = async () => {
        if (!nearWalletType) {
            throw 'No near wallet selected'
        }

        const account_id = enableDestiAddress ? destiAddress : nearAccount

        if (!account_id) {
            fail({
                title: 'Need near account'
            })
            return
        }

        if (!btcAccount) {
            fail({
                title: 'Need btc account'
            })
            return
        }

        let btnTempAddress

        const params: any = {}
        const _fromAmount = Number(new Big(fromAmount).mul(10 ** 8).toFixed(0))

        console.log('nearWalletType:', nearWalletType, fromAmount)

        if (nearWalletType === 'btc-wallet') {
            // btnTempAddress = await viewMethod({
            //     method: 'get_user_deposit_address',
            //     args: {
            //         deposit_msg: {
            //             recipient_id: nearAccount
            //         }
            //     }
            // })

            // console.log('btnTempAddress:', btnTempAddress)

            // params.btcPublicKey = btcPublicKey

            // params.depositType = 0


            setIsLoading(true)
            const hash: any = await executeBTCDepositAndAction({
                amount: _fromAmount.toString(),
                // fixedAmount: true,
                env: (process.env.NEXT_PUBLIC_BTC_WALLET_NET || 'testnet') as any,
                feeRate,
                pollResult: false,
                newAccountMinDepositAmount: false,
            })


            return hash || null
        } else {
            setIsLoading(true)
            btnTempAddress = await viewMethod({
                method: 'get_user_deposit_address',
                args: {
                    deposit_msg: {
                        recipient_id: nearAccount
                    }
                }
            })
            params.nearAddress = nearAccount
            params.depositType = 0
        }

        console.log('btnTempAddress:', btnTempAddress)

        await receivePreDepositMsg(params)

        const hash = await sendBitcoin(btnTempAddress, _fromAmount, {
            feeRate
        })

        params.txHash = hash

        const result = await receiveDepositMsg(params)

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
        }

        console.log('hash', hash)
        setIsLoading(false)
        return hash
    }

    const handleNearOrigin = async () => {
        setIsLoading(true)
        if (isError || !nBtcInOut.current) {
            return
        }

        const satoshis = fromAmountMuiusFee

        console.log('satoshis:', satoshis)

        const { inputs, outputs } = nBtcInOut.current

        console.log('inputs:', inputs, outputs)

        const network = process.env.NEXT_PUBLIC_BTC_NET === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin

        const psbt = new bitcoin.Psbt({ network });

        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i]
            const txData = await fetch(`${btcConfig.rpcEndpoint}tx/${input.txid}`).then(res => res.json());

            const inputOptions = {
                hash: input.txid,
                index: input.vout,
                sequence: 0xfffffffd,
                witnessUtxo: {
                    script: Buffer.from(txData.vout[input.vout].scriptpubkey, 'hex'),
                    value: input.value
                }
            };

            psbt.addInput(inputOptions);
        }

        console.log('outputs:', outputs)

        outputs.forEach((output: { address: string; value: any }) => {
            if (!output.address) {
                output.address = toAddress as string;
            }
            psbt.addOutput({
                address: output.address,
                value: output.value,
            });
        });

        // const bufs = psbt.toHex()

        const _inputs = inputs.map((item: any) => {
            return `${item.txid}:${item.vout}`
        })

        const txOutputs = psbt.txOutputs.map((item: any) => {
            return {
                script_pubkey: uint8ArrayToHex(item.script),
                value: item.value
            }
        })

        console.log('txOutputs:', txOutputs)

        const msg = {
            Withdraw: {
                target_btc_address: btcAccount,
                input: _inputs,
                output: txOutputs,
                // psbt_hex: bufs
            }
        }

        // console.log(JSON.stringify(JSON.stringify(msg)))

        console.log('bufs:', msg)

        const msgStr = JSON.stringify(msg)

        console.log('msgStr:', msgStr)

        // return

        const res: any = await callMethod({
            method: 'ft_transfer_call',
            args: {
                receiver_id: process.env.NEXT_PUBLIC_CONTRACT_ID,
                amount: satoshis.toString(),
                msg: msgStr
            }
        })

        setIsLoading(false)

        return res

    }


    useEffect(() => {
        if (isNear(walletType)) {
            setFromAddress(nearAccount)
            setToAddress(btcAccount)
            setFromChain(chains.near)
            setToChain(chains.btc)
            setFromBalance(nearBalance)
            setToBalance(btcBalance)
        } else if (isBtc(walletType)) {
            setFromAddress(btcAccount)
            setToAddress(nearAccount)
            setFromChain(chains.btc)
            setToChain(chains.near)
            setFromBalance(btcBalance)
            setToBalance(nearBalance)
        }
    }, [walletType, nearAccount, btcAccount, btcBalance, nearBalance])

    useEffect(() => {
        if (fromAmount && Number(fromAmount) > 0) {

            const _fromAmount = new Big(fromAmount).mul(10 ** 8).toNumber()
            if (isNear(walletType)) {

                let account_id = enableDestiAddress ? destiAddress : btcAccount

                setIsLoading(true)
                setIsError(false)

                // if (btcAccount && getBitcoinAddressType(btcAccount) === 'Taproot') {
                //     setIsError(true)
                //     setToAmount('')
                //     setErrorMsg('The taproot address is not allowed')
                //     return
                // }
                console.log('estimateNearGas _fromAmount:', _fromAmount, account_id as string)
                estimateNearGas(_fromAmount, account_id as string).then(res => {
                    console.log('estimateNearGas res:', res)
                    setIsLoading(false)
                    if (res) {
                        const { withdrawFee, gasFee, inputs, outputs, isError, errorMsg, receiveAmount, fromAmount: fromAmountMinusFee } = res
                        setIsError(isError)
                        setErrorMsg(errorMsg)
                        if (isError) {
                            setGasFee(gasFee ? prices.BTC * new Big(gasFee).div(10 ** 8).toNumber() : null)
                            setTradingFee(withdrawFee ? prices.BTC * new Big(withdrawFee).div(10 ** 8).toNumber() : null)
                            setToAmount('')
                            setTradingTime(null)
                            nBtcInOut.current = null
                            return
                        }

                        if (!nearBalance) {
                            // setGasFee(0)
                            setIsError(true)
                            setErrorMsg('Insufficient balance')

                            // return
                        } else {
                            // if (nearWalletType === 'btc-wallet' && new Big(fromAmount.toString()).mul(10 ** 8).gt(new Big(nearBalance?.toString()).mul(10 ** 8).minus(10000))) {
                            //     setIsError(true)
                            //     setErrorMsg('Must have 0.0001BTC or more left in wallet for gas fee')
                            // }

                            if (Number(fromAmount) > Number(nearBalance)) {
                                setIsError(true)
                                setErrorMsg('Insufficient balance')
                            }
                        }
                        const _gasFee = prices.BTC * new Big(gasFee).div(10 ** 8).toNumber()
                        const _tradingFee = prices.BTC * new Big(withdrawFee).div(10 ** 8).toNumber()
                        setGasFee(_gasFee)
                        setTradingFee(_tradingFee)
                        console.log('receiveAmount:', receiveAmount)
                        setToAmount(receiveAmount as string)
                        setTradingTime(time)
                        setFromAmountMuiusFee(new Big(fromAmount.toString()).mul(10 ** 8).toString())

                        nBtcInOut.current = {
                            inputs,
                            outputs,
                        }
                    } else {
                        setIsError(true)
                        setErrorMsg('Not enough gas')
                        setGasFee(0)
                    }

                })
            } else if (isBtc(walletType)) {
                console.log('nearWalletType:', nearWalletType)
                // if (btcAccount && getBitcoinAddressType(btcAccount) === 'Taproot') {
                //     setIsError(true)
                //     setToAmount('')
                //     setErrorMsg('The taproot address is not allowed')
                //     return
                // }


                if (!metaData?.min_deposit_amount) {
                    return
                }

                if (Number(fromAmount) < new Big(metaData.min_deposit_amount).div(10 ** 8).toNumber()) {
                    setGasFee(0)
                    setIsError(true)
                    setToAmount('')
                    setErrorMsg('The minimum deposit must be greater than or equal to ' + metaData.min_deposit_amount)
                    return
                }

                console.log('fromAmount:', fromAmount, 'gasFee:', gasFee, 'btcBalance:', btcBalance)

                if (!btcBalance ||  (Number(fromAmount) + Number(gasFee)) > Number(btcBalance)) {
                    setGasFee(0)
                    setIsError(true)
                    setToAmount('')
                    setErrorMsg('Insufficient balance')
                    return
                }

                setTradingTime(time)
                setIsLoading(true)

                estimateBtcGas(_fromAmount).then(async (res: any) => {
                    const { networkFee, realAmount, receiveAmount, isSuccess, fee } = res

                    console.log('fee:', res)

                    // console.log('estimateBtcGas res:', res)
                    console.log(walletType, selectedToken, isBtc(walletType) && selectedToken === 'aBTC')
                    // const querySwapRes = await querySwap({
                    //     tokenIn: NBTC_ADDRESS || 'nbtc.bridge.near',
                    //     tokenOut: ABTC_ADDRESS,
                    //     amountIn:new Big(fromAmount).minus(2000 / 10 ** 8).toString(),
                    //     tokenInDecimals: 8,
                    //     tokenOutDecimals: 18,
                    // })
                    let minAmount:any = '0'
                    if (isBtc(walletType) && selectedToken === 'aBTC') {
                        const querySwapRes = await querySwap({
                            tokenIn: NBTC_ADDRESS || 'nbtc.bridge.near',
                            tokenOut: ABTC_ADDRESS,
                            amountIn:new Big(fromAmount).minus(2000 / 10 ** 8).toString(),
                            tokenInDecimals: 8,
                            tokenOutDecimals: 18,
                        })
                        minAmount = (+querySwapRes.minAmountOut).toFixed(8)
                    }
                    

                    if (networkFee && isSuccess) {
                        setGasFee(prices.BTC * new Big(networkFee).div(10 ** 8).toNumber())
                        setTradingFee(prices.BTC * new Big(fee).div(10 ** 8).toNumber())
                        setIsError(false)
                        setToAmount(minAmount != '0' ? minAmount : receiveAmount)
                        setToBtcAmount(realAmount)
                    } else {
                        setIsError(true)
                        setErrorMsg('Not enough gas')
                        setGasFee(prices.BTC * new Big(networkFee).div(10 ** 8).toNumber())
                        setTradingFee(prices.BTC * new Big(fee).div(10 ** 8).toNumber())
                        setToAmount('')
                    }

                    setIsLoading(false)
                })
            }
        } else {
            setToAmount('')
            setTradingTime(null)
            setGasFee(null)
            setTradingFee(null)
        }
    }, [fromAmount, walletType, btcBalance, nearBalance, nearWalletType, enableDestiAddress, destiAddress, nearAccount, estimateUpdater])

    useEffect(() => {
        setEstimateUpdater(estimateUpdaterRef.current + 1)
    }, [feeRate])

    useEffect(() => {
        estimateUpdaterRef.current = estimateUpdater
    }, [estimateUpdater])

    return <div className={styles.wrapper} >
        <Header amount={''} onChange={() => { }} handlerEstimateUpdate={() => { setEstimateUpdater(estimateUpdater + 1) }} />
        <div style={{ height: 15 }}></div>
        <TokenInput
            amount={fromAmount}
            chain={fromChain}
            address={fromAddress}
            login={fromLogin}
            logout={fromLogout}
            title='From'
            balance={fromBalance}
            onAmountChange={v => {
                setFromAmount(v)
            }}
            isError={errorMsg !== 'Not enough gas' ? isError : false}
            errorMsg={errorMsg !== 'Not enough gas' ? errorMsg : ''}
            getMax={async () => {
                if (fromBalance && fromAddress) {
                    if (isBtc(walletType)) {
                        const max =await getBtcMax()
                        console.log('max:', max)
                        return max
                    }
                    return fromBalance
                }
                return null
            }}
            selectedToken={selectedToken}
            onTokenChange={(token) => {
                setSelectedToken(token)
                setFromAmount('')
                setToAmount('')
                setIsError(false)
                setErrorMsg('')
                setEstimateUpdater(estimateUpdater + 1)
            }}
        />
        <Swap onClick={() => {
            setIsError(false)
            if (isNear(walletType)) {
                changeWalletType(chains.btc)
            } else {
                changeWalletType(chains.near)
            }
            setSelectedToken(selectedToken)
            setFromAmount('')
        }} />
        <TokenInput
            amount={toAmount}
            chain={toChain}
            address={toAddress}
            login={toLogin}
            logout={toLogout}
            title='To'
            isError={errorMsg === 'Not enough gas' ? isError : false}
            errorMsg={errorMsg === 'Not enough gas' ? errorMsg : ''}
            balance={toBalance}
            inputDisbaled
            showLayer={enableDestiAddress}
            selectedToken={selectedToken}
            onTokenChange={(token) => {
                setSelectedToken(token)
                setFromAmount('')
                setToAmount('')
                setIsError(false)
                setErrorMsg('')
                setEstimateUpdater(estimateUpdater + 1)
            }}
        />
        {/* {
            !!toAddress && <DestinationAddress walletType={toChain} enabled={enableDestiAddress} destiAddress={destiAddress} onDestiAddressChange={(v: string) => {
                setDestiAddress(v)
            }} onEnableChange={() => {
                setEnableDestiAddress(!enableDestiAddress)
            }} onValidChange={(v: boolean) => {
                setDestiAddressValid(v)
            }} />
        } */}

        <Fee gas={gasFee} fee={tradingFee} time={tradingTime} />
        <div style={{ height: 15 }}></div>
        <Btn loading={isLoading} text='Send' disbaled={
            !btcAccount || !nearAccount || isLoading || !fromAmount || !toAmount || Number(fromAmount) <= 0 || (enableDestiAddress && (!destiAddress || !destiAddressValid)) || isError
        } onClick={async () => {
            // if (btcAccount && getBitcoinAddressType(btcAccount) === 'Taproot') {
            //     return
            // }

            if (!fromAmount || Number(fromAmount) <= 0 || (enableDestiAddress && !destiAddress)) {
                return
            }

            

            if (isError) {
                return
            }

            if (isLoading) {
                return
            }
            try {
                if (isBtc(walletType)) {
                    setcomfirmHash('')
                    console.log(selectedToken)
                    const hash = selectedToken === 'aBTC' ? await handleBtc() : await handleBtcOrigin()
                    console.log(hash, '1077')
                    // const hash  = 'b6d5d942409cf189a6ce42d6d1f6f384a9ef3328c977faf5811d6ff949edad60'
                    if (hash) {
                        setComfirmShow(true)
                        setcomfirmHash(hash)
                        setComfirmStatus(0)
                        setFromHash(hash)
                        setSignature('')
                        setFromChanId(1)
                    }

                } else if (isNear(walletType)) {
                    console.log('isNear', '....')
                    const wallet = await window.selector.wallet();
                    // setComfirmShow(true)
                    if (wallet.id === 'my-near-wallet')  {
                        await handleNear()
                    } else {
                        const {
                            signature,
                            hash,
                        } = await handleNear()
                           
                        if (nearWalletType === 'btc-wallet' && signature) {
                            
                            setComfirmShow(true)
                            setcomfirmHash(hash)
                            setComfirmStatus(0)
                            setFromHash('')
                            setSignature(signature)
                            setFromChanId(2)
                        }
                    }
                    
                 
                }

            } catch (e: any) {
                console.log(e)
                fail({
                    title: 'failed',
                    text: e.message
                })
                setIsLoading(false)
            }

        }} />

        {
            comfirmShow && <ConfirmBox
                status={comfirmStatus}
                hash={comfirmHash}
                fromChain={fromChain}
                toChain={toChain}
                onClose={() => {
                    setComfirmShow(false)
                    setFromAmount('')
                    setComfirmStatus(0)
                }} />
        }
    </div>
}


