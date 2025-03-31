import { useCallback, useEffect, useState } from "react";

import { useNearWalletSelector } from "@/context/nearWalletSelectorContext";
import { useBtcWalletSelector } from "@/context/btcWalletSelectorContext";
import { useWalletType } from "@/context/walletTypeContext";
import type { Chain } from "@/util/chains";
import { checkSatoshiWhitelist } from "btc-wallet";

export function isNear(walletType: Chain) {
    return walletType.name === 'NEAR'
}

export function isBtc(walletType: Chain) {
return walletType.name === 'BTC'
}

export default function useAccount() {
    const { walletType, changeWalletType } = useWalletType()
    const [account, setAccount] = useState<string | null>(null)
    const { login: nearLogin, logout: nearLogout, account: nearAccount } = useNearWalletSelector();
    const { login: btcLogin, logout: btcLogout, account: btcAccount } = useBtcWalletSelector()

    const login = useCallback(() => {
        if (isNear(walletType)) {
            nearLogin()
        } else if (isBtc(walletType)) {
            btcLogin()
        }


    }, [walletType])

    const logout = useCallback(() => {
        if (isNear(walletType)) {
            nearLogout()
        } else if (isBtc(walletType)) {
            btcLogout()
        }

        setAccount(null)
    }, [walletType])

    useEffect(() => {
        if (isNear(walletType) && nearAccount) {
            setAccount(nearAccount)
        } else if (isBtc(walletType) && btcAccount) {
            setAccount(btcAccount)
        } else {
            setAccount(null)
        }

    }, [walletType, nearAccount, btcAccount])

    useEffect(() => {
        if (btcAccount) {
           checkSatoshiWhitelist(btcAccount, (process.env.NEXT_PUBLIC_BTC_WALLET_NET || 'dev') as any).then(x => {
            console.log('checkSatoshiWhitelist:', x)
           })
            
        }
    }, [btcAccount])

    return {
        walletType,
        changeWalletType,
        login,
        nearLogin,
        btcLogin,
        logout,
        nearLogout,
        btcLogout,
        account,
        nearAccount,
        btcAccount,
    }
}