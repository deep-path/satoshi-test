import styles from './btn.module.css'
import useAccount, { isBtc, isNear } from '@/hook/useAccount'
import useToast from '@/hook/useToast'


interface Props {
    text: string;
    onClick: () => void;
    disbaled?: boolean;
    loading?: boolean;
    nearAccount?: string;
    btcAccount?: string;
}

export default function Btn({ text, disbaled, onClick, loading = false, nearAccount, btcAccount }: Props) {
    const { success, fail } = useToast()
    // const { walletType, changeWalletType, login, logout, nearLogin, nearLogout, btcLogin, btcLogout, account, nearAccount, btcAccount } = useAccount()
    // if (!nearAccount) {
    //     return <button onClick={ nearLogin } className={ styles.wrapper }>Connect Near Wallet</button>
    // }

    // if (!btcAccount) {
    //     return <button onClick={ btcLogin } className={ styles.wrapper }>Connect Btc Wallet</button>
    // }

    return <button style={{ opacity: disbaled ? '0.6' : '1' }} onClick={ () => {
        if (loading) {
            return
        }

        if (disbaled) {
            return
        }
        // if (!nearAccount || !btcAccount) {
        //     fail({
        //         title: 'Need to connect wallet'
        //     })
        //     return
        // }
        onClick && onClick()
    } } className={ styles.wrapper }>
        <div className={ loading ? styles.loading : '' }></div>
        { !loading && text }
    </button>
}