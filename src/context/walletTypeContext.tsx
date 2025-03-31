"use client"

import type { ReactNode } from "react";
import React, {
    useCallback,
    useContext,
    useEffect,
    useState,
    useMemo,
} from "react";

import chains from "@/util/chains";

import type { Chain } from "@/util/chains";

interface WalletTypeContextValue {
    walletType: Chain;
    changeWalletType: (c: Chain) => void;
}

const WalletTypeContext =
    React.createContext<WalletTypeContextValue | null>(null);

export const WalletTypeContextProvider: React.FC<{
    children: ReactNode;
}> = ({ children }) => {
    const [walletType, setWalletType] = useState(chains.btc)

    const walletTypeContextValue = useMemo<WalletTypeContextValue>(
        () => ({
            walletType,
            changeWalletType: (newChain) => {
                window.history.pushState({ walletType: newChain.name }, '', `?walletType=${newChain.name}`)
                setWalletType(newChain)
            }
        }),
        [walletType]
    );

    useEffect(() => {
        const { search } = window.location

        const searchParams = new URLSearchParams(search)
        const walletType = searchParams.get('walletType')?.toString()
        if (!walletType) {
            return
        }
        if (walletType === chains.btc.name) {
            setWalletType(chains.btc)
        } else if (walletType === chains.near.name) {
            setWalletType(chains.near)
        }

        // console.log('walletType: ', walletType)
        // const transactionHashes = searchParams.get('transactionHashes')
    }, [])

    return (
        <WalletTypeContext.Provider value={walletTypeContextValue}>
            {children}
        </WalletTypeContext.Provider>
    );
}

export function useWalletType() {
    const context = useContext(WalletTypeContext);

    if (!context) {
        throw new Error(
            "useWalletType must be used within a WalletTypeContextProvider"
        );
    }

    return context;
}