"use client"

import Link from 'next/link'
import Image from 'next/image';
import { usePathname } from 'next/navigation'

import DropDown from '@/component/dropdown';
import chains from '@/util/chains';
import useAccount, { isNear } from '@/hook/useAccount';
import { formatAddress } from '@/util'

import styles from './header.module.css'
import { useState } from 'react';

const paths = [{
    route: '/',
    name: 'Transfer'
}, {
    route: '/history',
    name: 'Transaction History'
}]

const chainList = Object.values(chains)

export default function Header() {
    const [selectorShow, setSelectorShow] = useState(false)
    const [layerShow, setLayerShow] = useState(false)
    const route = usePathname()
    const { walletType, changeWalletType, login, logout, account, nearLogin, btcLogin } = useAccount()

    return <><div className={styles.wrapper}>
        <div className={styles.logoMenu}>
            <a href="/" className={styles.logoBig}>
                <img src="/imgs/layout/header/logo.svg" />
            </a>
            <a href="/" className={styles.logoMini}>
                <img src="/imgs/layout/header/logo-mini.svg" />
            </a>
            <div className={styles.menu}>
                {
                    paths.map(path => {
                        return <Link
                            key={path.route}
                            href={path.route}
                            className={styles.menuItem + ` ${path.route === route ? styles.active : ''}`}>
                            {path.name}
                        </Link>
                    })
                }
            </div>
        </div>

        <div className={styles.accountWrapper}>
            {
                account ? <div className={styles.accountWrapper}>
                    <DropDown position='right' render={() => {
                        return <div className={styles.layer}>
                            {
                                chainList.map(chain => {
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
                            }
                        </div>
                    }}>
                        <div className={styles.accountDrop}>
                            <div className={styles.account}>
                                <div className={styles.chainIcon}>
                                    <Image src={walletType.icon} width={24} height={24} alt={walletType.name} />
                                </div>
                                <div className={styles.accountAddress}>{formatAddress(account)}</div>
                                <svg width="11" height="7" viewBox="0 0 11 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L5.401 5L9.57143 1" stroke="#808095" stroke-width="2" stroke-linecap="round" />
                                </svg>
                            </div>
                            <div className={styles.chain}>
                                <Image src={walletType.icon} width={24} height={24} alt={walletType.name} />
                            </div>
                        </div>
                    </DropDown>
                    {/* <div onClick={ handleSignOut }>Log out</div> */}
                </div> :
                    <div className={styles.connectWallet} onClick={() => {
                        if (isNear(walletType)) {
                            nearLogin()
                            // setSelectorShow(true)
                        } else {
                            btcLogin()
                        }

                    }}>
                        Connect Wallet
                    </div>
            }
            <div className={styles.miniMenu} onClick={() => {
                setLayerShow(true)
            }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="16" height="2" rx="1" fill="#7E8A93" />
                    <rect y="7" width="16" height="2" rx="1" fill="#7E8A93" />
                    <rect y="14" width="16" height="2" rx="1" fill="#7E8A93" />
                </svg>
            </div>
        </div>

        {
            layerShow && <div className={styles.miniMenuLayer} onClick={() => {
                setLayerShow(false)
            }}>
                <div className={styles.menuLayerContnt} onClick={(e) => {
                    e.stopPropagation()
                }}>
                    <div className={styles.miniMenuItems} onClick={() => {
                        setLayerShow(false)
                    }}>
                        {
                            paths.map(path => {
                                return <Link
                                    key={path.route}
                                    href={path.route}
                                    className={styles.miniMenuItem + ` ${path.route === route ? styles.itemActive : ''}`}>
                                    {path.name}
                                </Link>
                            })
                        }

                        <div className={styles.layerLogo}>
                            <img src="/imgs/layout/header/logo.svg" />
                        </div>
                    </div>
                </div>
            </div>
        }


    </div>
    </>
}