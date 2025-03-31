import { useBTCProvider, useBtcWalletSelector, useConnector, estimateDepositAmount, getDepositAmount, getBtcBalance } from 'btc-wallet';
import { useCallback, useEffect, useState } from 'react';
import Big from 'big.js'

import { base_url } from '@/config'
import { viewMethod } from './useNear'
import { useFeeRate } from './useFeeRate';

// @ts-ignore
import coinselect from 'coinselect';

interface Props {
    updater: number
}

export function computeNetworkFee(inputSize: number, outputSize: number, feeRate: number = 30): number {
    return (10.5 + inputSize * 148 + outputSize * 31) * feeRate
}

function calculateTransactionSize(numInputs: number, numOutputs: number, feeRate: number = 30) {
    // console.log('(10 + (115 * numInputs) + (34 * numOutputs)):', (10 + (115 * numInputs) + (34 * numOutputs)))
    return (10 + (115 * numInputs) + (34 * numOutputs)) * feeRate;
}

const blockstreamApi = process.env.NEXT_PUBLIC_BTC_NET === 'testnet' ? 'https://blockstream.info/testnet/api/address' : 'https://blockstream.info/api/address'

export function useBtcAction({
    updater
}: Props) {
    const [balance, setBalance] = useState<string | null>(null)
    const [btcPublicKey, setPublicKey] = useState<string | null>(null)
    const { accounts, sendBitcoin, provider, getPublicKey, signMessage } = useBTCProvider();
    const { account } = useBtcWalletSelector()
    

    // console.log('provider:', provider)

    // @ts-ignore
    const { feeRate } = useFeeRate()

    const receiveDepositMsg = useCallback(async (args: any) => {
        console.log('.....receiveDepositMsg 42', args)
        const res = await fetch(`${base_url}/receiveDepositMsg`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(args)
        }).then(res => res.json())

        console.log(res, 'receiveDepositMsg')

        return res
    }, [])

    const receivePreDepositMsg = useCallback(async (args: any) => {
        console.log('...preReceiveDepositMsg 57',args )
        const res = await fetch(`${base_url}/preReceiveDepositMsg`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(args)
        }).then(res => res.json())

        console.log(res, 'preReceiveDepositMsg')
        return res
    }, [])

    const getBalance = useCallback(async() => {
        if (account) {
            fetch(`${blockstreamApi}/${account}`)
            .then(res => res.json())
            .then(data => {
                const balance = (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 1e8
                setBalance(String(balance))
            })
        }
    }, [account])

    // const getBalance = useCallback(() => {
    //     if (account){
    //     getBtcBalance().then(res => {
    //      // setBalance(res.balance)
    //      setBalance(res.balance.toString())
    //     })
    //     }
    // }, [account])
    

    useEffect(() => {
        if (account) {
            getBalance()

            getPublicKey().then(publicKey => {
                setPublicKey(publicKey)
            })
        } else {
            setBalance('')
            setPublicKey('')
        }

        const inter = setInterval(() => {
            getBalance()
        }, 10000)

        return () => {
            clearInterval(inter)
        }

    }, [account, updater])

    const getUtxo = useCallback(() => {
        return fetch(`${blockstreamApi}/${account}/utxo`)
            .then(res => res.json()).then(res => {
                return res.filter((item: any) => {
                    return item.status.confirmed
                })
            })
    }, [account])

    const _estimateGas = useCallback(async (fromAmount: number) => {
        
        const utxos = await getUtxo()

        const comfirmedUtxos = utxos

        // if (utxos && utxos.length) {
        //     for (let i = 0;i < utxos.length;i++) {
        //         const val = await fetch(`https://blockstream.info/testnet/api/tx/${utxos[i].txid}`).then(res => res.json())
        //         if (val.status.confirmed) {
        //             comfirmedUtxos.push({
        //                 // ...utxos[i],
        //                 value: utxos[i].satoshis,
        //                 script: utxos[i].scriptPk
        //             })
        //         }
        //     }
        // }

        comfirmedUtxos.sort((a: any, b: any) => {
            return b.satoshis - a.satoshis
        })

        // console.log(calculateTransactionSize(comfirmedUtxos.length, 1, feeRate))

        const _fromAmount = Number(fromAmount) - calculateTransactionSize(2, 2, feeRate)

        let index = 0, sum = 0, networkFee = 0

        // for (let i = index; i < comfirmedUtxos.length; i++) {
        //     sum +=  comfirmedUtxos[i].value

        //     console.log(sum, fromAmount)

        //     if (sum >= fromAmount) {
        //         index = i
        //         console.log('index:', index)
        //         networkFee = calculateTransactionSize(index + 1, 2, feeRate)
        //         console.log('networkFee: ', networkFee, fromAmount, sum, fromAmount + networkFee, sum - fromAmount > networkFee)
        //         break;
        //         // if (sum - fromAmount > networkFee) {
        //         //     break
        //         // } else if (i === comfirmedUtxos.length - 1) {
        //         //     // networkFee = 0
        //         // }
        //     }
        // }


        // let sum = 0
        // utxos.forEach(item => sum += item.satoshis)

        // console.log('sum:', sum)


        let { inputs, outputs, fee } = coinselect(
            comfirmedUtxos,
            [{ address: '', value: _fromAmount }],
            Math.ceil(feeRate),
        );



        return {
            networkFee: fee,
            realAmount: fromAmount,
        }
    }, [feeRate, account])

    const estimateGas = useCallback(async (fromAmount: number) => {
        const metaData = await viewMethod({
            method: 'get_config',
            args: {}
        })

        console.log('metaData:', metaData)

        // if (metaData.min_deposit_amount) {
        //     if (Number(fromAmount) < Number(metaData.min_deposit_amount)) {
        //         return {
        //             networkFee: 0,
        //             isError: true,
        //             errorMsg: 'Mini deposit amount is ' + metaData.min_deposit_amount,
        //         }
        //     }
        // }

        // const { deposit_bridge_fee } = metaData

        // const val = Number(deposit_bridge_fee.fee_rate) * fromAmount

        // const _fee = val < Number(deposit_bridge_fee.fee_min) ? Number(deposit_bridge_fee.fee_min) : val
        
        // console.log('_fee', _fee)

        // const { networkFee, realAmount } = await _estimateGas(fromAmount)
        // console.log('networkFee', networkFee, realAmount)
        // if (networkFee && realAmount && networkFee < realAmount) {
        //     // const { networkFee: realNetworkFee, realAmount: realRealAmount } = await _estimateGas(realAmount - networkFee)
        //     // console.log('realAmount:', fromAmount, realAmount, networkFee, realNetworkFee)
        //     return {
        //         networkFee: networkFee,
        //         fee: _fee,
        //         realAmount: new Big(new Big(realAmount).minus(networkFee).toFixed(0)).div(10 ** 8).toString(),
        //         receiveAmount: new Big(new Big(realAmount).minus(networkFee).minus(_fee).toFixed(0)).div(10 ** 8).toString(),
        //         isSuccess: true,
        //     }
        // }

        const {
            depositAmount: receiveAmount,
            totalDepositAmount,
            protocolFee,
            repayAmount,
            newAccountMinDepositAmount

        } = await getDepositAmount(
            String(fromAmount),
            {
                env: process.env.NEXT_PUBLIC_BTC_WALLET_NET as any
            }
        )

        console.log('fromAmount:', receiveAmount, totalDepositAmount, protocolFee, repayAmount, newAccountMinDepositAmount)

        const utxos = await getUtxo()

        let { inputs, outputs, fee } = coinselect(
            utxos,
            [{ address: '', value: Number(fromAmount)}],
            Math.ceil(feeRate),
        );

        console.log('fee:', fee, receiveAmount)

        return {
            networkFee: fee,
            fee: Number(protocolFee) + Number(repayAmount),
            realAmount: fromAmount,
            receiveAmount: new Big(receiveAmount).div(10 ** 8).toString(),
            isSuccess: true
        }
    }, [feeRate, account])

    async function getMax() {
        const utxos = await getUtxo()
        if (!utxos || utxos.length === 0) {
            return null
        }

        const sum = Number(utxos.reduce((acc: number, utxo: any) => acc + utxo.value, 0))

        let { inputs, outputs, fee } = coinselect(
            utxos,
            [{ address: '', value: sum }],
            Math.ceil(feeRate),
        );

        // const inputSize = (utxos?.length || 0) * 69;
        // const outputSize = 33 * 2;
        // const overheadSize = 11;
        // const estimatedTxSize = inputSize + outputSize + overheadSize;

        // const estimatedFee = Math.ceil(estimatedTxSize * feeRate);

        // console.log('fee:', fee, 'estimatedFee:', estimatedFee)

        if (fee) {
            return new Big(sum - fee).div(10 ** 8).toFixed(8)
        }

        return null
    }


    return {
        balance,
        sendBitcoin,
        receiveDepositMsg,
        receivePreDepositMsg,
        getUtxo,
        estimateGas,
        btcPublicKey,
        signMessage,
        getMax
    }
}