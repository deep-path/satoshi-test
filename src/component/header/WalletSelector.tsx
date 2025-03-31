import { useState } from "react";
import Modal from "../modal";
import styles from './wallet.module.css'
import useAccount from "@/hook/useAccount";
import { useBtcAction } from "@/hook/useBtc";

function Radio({ checked = false }: any) {
    return <div className={styles.radio + ' ' + (checked ? styles.active : '')}></div>
}

export default function WalletSelector({ onClose, onNearLogin, onBtcLogin }: any) {
    const [ selectWalletType, setWalletType] = useState(1)

    return <Modal onClose={onClose}>
        <div className={ styles.wrapper }> 
            <div className={styles.title}>Please select the wallet to control your assets after cross-chain transfer</div>
            <div className={styles.list}>
                <div className={styles.item} onClick={() => { setWalletType(1) }}>
                    <Radio checked={ selectWalletType === 1 }/>
                    <div className={styles.walletName}>BTC wallet</div>
                </div>
                <div className={styles.item} onClick={() => { setWalletType(2) }}>
                    <Radio checked={ selectWalletType === 2 }/>
                    <div className={styles.walletName}>NEAR wallet</div>
                </div>
            </div>
            <button onClick={() => {
                if (selectWalletType === 1) {
                    onBtcLogin()
                    onClose && onClose()
                } else if (selectWalletType === 2) {
                    onNearLogin()
                    onClose && onClose()
                }
            }} className={ styles.confirm }>Confirm</button>
        </div>
    </Modal>
}