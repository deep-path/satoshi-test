"use client"

import { useFeeRate } from '@/hook/useFeeRate';
import { usePrice } from '@/hook/usePrice';
import { getBtcFeeRate, getPrices } from '@/util';
import {
    useBTCProvider,
    useConnectModal,
} from 'btc-wallet';
import { useEffect } from 'react';

export function useBtcWalletSelector() {
    const { accounts, sendBitcoin } = useBTCProvider();
    // @ts-ignore
    const { set: setFee, fees, feeRate, feeIndex } = useFeeRate()
    // @ts-ignore
    const { set: setPrices, prices } = usePrice()

    useEffect(() => {
        getBtcFeeRate().then(feeRate => {
            fees[0].value = feeRate.fast
            fees[1].value = feeRate.avg
            fees[2].value = feeRate.minimumFee
            fees[3].value = feeRate.fast

            setFee({
                fees: [...fees],
                feeRate: fees[feeIndex].value,
                feeIndex: feeIndex
            })
        })

        getPrices().then((prices: any) => {
            const _prices: any = {}
            if (prices.token_contract_id === '2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near') {
                _prices.BTC = Number(prices.price)
            }

            setPrices({
                prices: _prices,
            })
        })
    }, [])

    return {
        login: () => {
            window.btcContext.login()
        },
        logout: () => {
            window.btcContext.logout()
        },
        account: accounts.length ? accounts[0] : null
    }
}