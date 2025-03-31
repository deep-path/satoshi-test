"use client"

import Image from 'next/image'

import styles from './header.module.css'

import useAccount, { isNear, isBtc } from '@/hook/useAccount'
import DropDown from '@/component/dropdown';
import chains from '@/util/chains';
import { formatAddress } from '@/util'
import Copyed from '@/component/copyed';

function Arrow() {
    return <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L6 6L11 1" stroke="#7E8A93" stroke-width="2" stroke-linecap="round" />
    </svg>
}

const chainList = Object.values(chains)

interface Props {
    searchText: string;
    onSearchTextChange: (v: string) => void;
    total: any;
}

export default function Header({ searchText, onSearchTextChange, total }: Props) {
    const { walletType, changeWalletType, login, logout, nearLogin, nearLogout, btcLogin, btcLogout, account, nearAccount, btcAccount } = useAccount()


    return <div className={styles.bg}>
        <div className={styles.wrapper}>
            <div className={styles.titleContent}>
                <div className={styles.title}>Bridge Transaction History</div>
                <div className={styles.menu}>
                    <div className={ styles.accountSelect }>
                    <div className={styles.menuTitle}>Account</div>
                    <DropDown render={() => {
                        return chainList.map(chain => {
                            return <div className={styles.layerItem} key={chain.name} onClick={() => {
                                changeWalletType(chain)
                            }}>
                                <Image src={chain.icon} width={24} height={24} alt={chain.name} />
                                <div>{chain.name}</div>
                                {
                                    walletType === chain && <div className={styles.cur}></div>
                                }
                            </div>
                        })
                    }}>
                        <div className={styles.chainItem}>
                            <div>{walletType.name}</div>
                            <Arrow />
                        </div>
                    </DropDown>
                    </div>
                    {
                        account ? <div style={{ display: 'flex' }}><div onClick={logout} className={styles.addressWrapper + ' ' + (true ? styles.from : styles.to)}>
                            <div>{formatAddress(account)}</div>
                            <div className={styles.disConnect}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="8" cy="8" r="8" fill={'#FF7A00' } />
                                    <path d="M8.03701 6.35841L9.01102 5.38371L9.0281 5.36661C9.24455 5.15571 9.52365 5.04171 9.82554 5.04741C10.1274 5.04741 10.4065 5.16711 10.6173 5.37801C10.828 5.58891 10.9476 5.87391 10.9476 6.17031C10.9476 6.47241 10.8337 6.75171 10.6287 6.96831L10.6116 6.98541L9.63757 7.96011L10.378 8.70112L11.3805 7.69791C12.2121 6.84861 12.2064 5.48061 11.3634 4.63701C10.5204 3.7934 9.15911 3.7877 8.30472 4.61991L7.29653 5.61741L8.03701 6.35841ZM8.69204 10.3769L7.95157 9.63592L7.71804 9.87532L6.97756 10.6163L6.97186 10.622C6.53328 11.0609 5.81559 11.0552 5.377 10.6163C4.93841 10.1774 4.93841 9.46492 5.3713 9.02032L5.377 9.01462L6.11747 8.27361L6.3567 8.03421L5.61623 7.29321L4.64222 8.27931L4.63652 8.28502C3.78783 9.13432 3.78783 10.5137 4.63652 11.363C5.48522 12.2123 6.86364 12.2123 7.71234 11.363L7.71804 11.3573L8.69204 10.3769ZM9.93946 10.7588L5.22321 6.04491C5.17381 5.99478 5.14612 5.92721 5.14612 5.85681C5.14612 5.78641 5.17381 5.71884 5.22321 5.66871L5.70167 5.18991C5.75176 5.14048 5.81928 5.11277 5.88963 5.11277C5.95998 5.11277 6.02751 5.14048 6.0776 5.18991L10.7882 9.90382C10.8907 10.0064 10.8907 10.1774 10.7882 10.28L10.3097 10.7588C10.2072 10.8671 10.042 10.8671 9.93946 10.7588Z" fill="#7E8A93" />
                                    <path d="M8.03701 6.35841L9.01102 5.38371L9.0281 5.36661C9.24455 5.15571 9.52365 5.04171 9.82554 5.04741C10.1274 5.04741 10.4065 5.16711 10.6173 5.37801C10.828 5.58891 10.9476 5.87391 10.9476 6.17031C10.9476 6.47241 10.8337 6.75171 10.6287 6.96831L10.6116 6.98541L9.63757 7.96011L10.378 8.70112L11.3805 7.69791C12.2121 6.84861 12.2064 5.48061 11.3634 4.63701C10.5204 3.7934 9.15911 3.7877 8.30472 4.61991L7.29653 5.61741L8.03701 6.35841ZM8.69204 10.3769L7.95157 9.63592L7.71804 9.87532L6.97756 10.6163L6.97186 10.622C6.53328 11.0609 5.81559 11.0552 5.377 10.6163C4.93841 10.1774 4.93841 9.46492 5.3713 9.02032L5.377 9.01462L6.11747 8.27361L6.3567 8.03421L5.61623 7.29321L4.64222 8.27931L4.63652 8.28502C3.78783 9.13432 3.78783 10.5137 4.63652 11.363C5.48522 12.2123 6.86364 12.2123 7.71234 11.363L7.71804 11.3573L8.69204 10.3769ZM9.93946 10.7588L5.22321 6.04491C5.17381 5.99478 5.14612 5.92721 5.14612 5.85681C5.14612 5.78641 5.17381 5.71884 5.22321 5.66871L5.70167 5.18991C5.75176 5.14048 5.81928 5.11277 5.88963 5.11277C5.95998 5.11277 6.02751 5.14048 6.0776 5.18991L10.7882 9.90382C10.8907 10.0064 10.8907 10.1774 10.7882 10.28L10.3097 10.7588C10.2072 10.8671 10.042 10.8671 9.93946 10.7588Z" fill="black" />
                                </svg>
                            </div>
                        </div>
                        <Copyed value={account}/>
                        </div> : <div className={styles.connect} onClick={login}>Connect</div>
                    }
                </div>
            </div>

            {/* <div>
                <div className={styles.searchBox}>
                    <input className={styles.input} value={searchText} onChange={(e) => {
                        onSearchTextChange(e.target.value)
                    }} placeholder='Transaction Hash' />
                    <div className={styles.searchIcon}>
                        {
                            searchText ? <svg onClick={() => {
                                onSearchTextChange('')
                            }} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="10" fill="#808095" fill-opacity="0.3"/>
                            <path d="M11.1552 9.99998L13.8239 7.33132C14.0245 7.13065 14.0588 6.83952 13.9005 6.68126L13.3186 6.09939C13.1602 5.94106 12.8695 5.97579 12.6685 6.17632L10.0001 8.84492L7.33146 6.17639C7.13079 5.97553 6.83966 5.94106 6.68132 6.09959L6.09945 6.68152C5.94118 6.83959 5.97545 7.13072 6.17638 7.33139L8.84507 9.99998L6.17638 12.6688C5.97578 12.8693 5.94105 13.1602 6.09945 13.3186L6.68132 13.9005C6.83966 14.0588 7.13079 14.0245 7.33146 13.8239L10.0002 11.1551L12.6686 13.8235C12.8696 14.0246 13.1603 14.0588 13.3186 13.9005L13.9005 13.3186C14.0588 13.1602 14.0245 12.8693 13.824 12.6685L11.1552 9.99998Z" fill="#00022C" fill-opacity="0.5"/>
                            </svg>
                             : <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="8" r="7" stroke="#00022C" stroke-width="2" />
                                <path d="M16.4 15.8C16.8418 16.1314 17.4686 16.0418 17.8 15.6C18.1314 15.1582 18.0418 14.5314 17.6 14.2L16.4 15.8ZM12.4 12.8L16.4 15.8L17.6 14.2L13.6 11.2L12.4 12.8Z" fill="#00022C" />
                            </svg>
                        }
                    </div>
                </div>
                <div className={styles.total}><span>Total:</span><span className={styles.totalNum}>{ total }</span></div>
            </div> */}

        </div>
    </div>
}