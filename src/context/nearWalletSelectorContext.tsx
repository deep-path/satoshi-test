"use client"

import type { AccountState, WalletSelector } from "@near-wallet-selector/core";
import { setupWalletSelector } from "@near-wallet-selector/core";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupBTCWallet } from "btc-wallet"
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { distinctUntilChanged, map } from "rxjs";

import { Loading } from "@/component/loading";

import type { ReactNode } from "react";
const CONTRACT_ID: any = process.env.NEXT_PUBLIC_CONTRACT_ID;

declare global {
  interface Window {
    selector: WalletSelector;
    modal: WalletSelectorModal;
  }
}

interface WalletSelectorContextValue {
  selector: WalletSelector;
  modal: WalletSelectorModal;
  accounts: Array<AccountState>;
  accountId: string | null;
  login: () => void;
  walletType: string | null;
}

const WalletSelectorContext =
  React.createContext<WalletSelectorContextValue | null>(null);

export const NearWalletSelectorContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [walletType, setNearWalletType] = useState<null | string>(null)

  const init = useCallback(async () => {
    const _selector = await setupWalletSelector({
      network: (process.env.NEXT_PUBLIC_NEAR_NET || "testnet") as any,
      debug: true,
      modules: [
        setupMyNearWallet(),
        setupBTCWallet({
          syncLogOut: false,
          env: (process.env.NEXT_PUBLIC_BTC_WALLET_NET || 'testnet') as any,
        }) as any
        // ca,
      ],
    });
    const _modal = setupModal(_selector, {
      contractId: CONTRACT_ID,
    });
    const state = _selector.store.getState();
    setAccounts(state.accounts);

    console.log('_selector:', _selector)

    // this is added for debugging purpose only
    // for more information (https://github.com/near/wallet-selector/pull/764#issuecomment-1498073367)
    window.selector = _selector;
    window.modal = _modal;

    setSelector(_selector);
    setModal(_modal);
    setLoading(false);
    setNearWalletType(state.selectedWalletId)
  }, []);

  useEffect(() => {
    init().catch((err) => {
      console.error(err);
      alert("Failed to initialise wallet selector");
    });
  }, [init]);

  useEffect(() => {
    if (!selector) {
      return;
    }

    const subscription = selector.store.observable
      .pipe(
        map((state) => state),
        distinctUntilChanged()
      )
      .subscribe(async (state) => {
        const { accounts, selectedWalletId } = state
        console.log("Accounts Update", accounts);
        if (!accounts || !accounts.length || !accounts[0].accountId) {
          setAccounts([]);
          setNearWalletType(null)
          const wallet = await selector.wallet();

          wallet.signOut().catch((err: any) => {
            console.log("Failed to sign out");
            console.error(err);
          });
        } else {
          setAccounts(accounts);
          setNearWalletType(selectedWalletId)
        }
      });

    const onHideSubscription = modal!.on("onHide", ({ hideReason }) => {
      console.log(`The reason for hiding the modal ${hideReason}`);
    });

    return () => {
      subscription.unsubscribe();
      onHideSubscription.remove();
    };
  }, [selector, modal]);

  const walletSelectorContextValue = useMemo<WalletSelectorContextValue>(
    () => {
      const accountId = (accounts.find((account) => account.active)?.accountId || null)

      return {
        selector: selector!,
        modal: modal!,
        login: () => {
          modal?.show()
        },
        walletType,
        accounts,
        accountId,
      }
    },
    [selector, modal, accounts]
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <WalletSelectorContext.Provider value={walletSelectorContextValue}>
      {children}
    </WalletSelectorContext.Provider>
  );
};

export function useNearWalletSelector() {
  const context = useContext(WalletSelectorContext);

  if (!context) {
    throw new Error(
      "useWalletSelector must be used within a WalletSelectorContextProvider"
    );
  }

  return {
    login: () => {
      context.login()
    },
    logout: async () => {
      const wallet = await context.selector.wallet();

      wallet.signOut().catch((err) => {
        console.log("Failed to sign out");
        console.error(err);
      });
    },
    walletType: context.walletType,
    account: context.accountId,
    context,
    calculateGasLimit: async (param: any) => {
      const wallet = await context.selector.wallet();
      // @ts-ignore
      return wallet.calculateGasLimit(param)
    }
  };
}