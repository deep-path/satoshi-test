import Image from "next/image";
import { formatAddress, balanceFormated } from '@/util'
import Big from 'big.js'
import styles from './token.module.css'
import { useState, useEffect, useRef } from 'react';

import type { Chain } from "@/util/chains";
import { isBtc, isNear } from "@/hook/useAccount";
import Copyed from "@/component/copyed";
import { usePrice } from '@/hook/usePrice';
import DropDown from '@/component/dropdown';
import chains from '@/util/chains';

interface Props {
    chain: Chain;
    address: string | null;
    login: () => void;
    logout: () => void;
    amount: string;
    onAmountChange?: (v: string) => void;
    inputDisbaled?: boolean;
    balance: string | null;
    isError?: boolean;
    errorMsg?: string | null;
    showLayer?: boolean;
    title: string;
    getMax?: () => any;
    selectedToken?: string;
    onTokenChange?: (token: string) => void;
}

export default function TokenInput({
    title, chain, address, login, logout, amount, inputDisbaled = false, balance, getMax, onAmountChange, isError = false, errorMsg = '', showLayer = false, selectedToken = 'BTC', onTokenChange
}: Props) {
    // @ts-ignore
    const { prices } = usePrice()
    const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsTokenDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const renderTokenOptions = () => {
        return (
            <div className={styles.tokenOptionsWrapper}>
                {/* <div className={styles.tokenOptionsHeader}>Select Token</div> */}
                <div className={styles.tokenOptionsList}>
                    <div 
                        className={styles.tokenOption} 
                        onClick={() => onTokenChange?.('BTC')}
                    >
                        <Image src="/imgs/layout/header/nbtc.svg" alt="BTC" width={24} height={24} />
                        <span>BTC</span>
                    </div>
                    <div 
                        className={styles.tokenOption} 
                        onClick={() => onTokenChange?.('aBTC')}
                    >
                        <Image src="/imgs/layout/header/abtc.svg" alt="NEAR" width={24} height={24} />
                        <span>aBTC</span>
                    </div>
                </div>
            </div>
        );
    };

    return <div className={styles.wrapper + `${isError ? ' ' + styles.error : ''}`}>
        <div className={styles.header}>
            <div className={styles.chain}>
                <div className={styles.title}>{title}</div>
                <div className={styles.icon}>
                    <Image className={styles.chainIcon} src={chain.icon} alt={chain.name} width={26} height={26} />
                </div>
                <div className={styles.chainName}>{chain.name}</div>
                <div className={styles.dropdown}>
                    {/* <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.5 1.5L5 4.5L8.5 1.5" stroke="#808095" stroke-width="1.5" stroke-linecap="round" />
                    </svg> */}
                </div>
            </div>
            {
                address ? <div style={{ display: 'flex' }}><div className={styles.addressWrapper + ' ' + (title === 'From' ? styles.from : styles.to)}>
                    <div onClick={() => {
                    }}>{formatAddress(address)}</div>
                    <div onClick={logout} className={styles.disConnect}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="8" cy="8" r="8" fill={title === 'From' ? '#FF7A00' : '#8000FF'} />
                            <path d="M8.03701 6.35841L9.01102 5.38371L9.0281 5.36661C9.24455 5.15571 9.52365 5.04171 9.82554 5.04741C10.1274 5.04741 10.4065 5.16711 10.6173 5.37801C10.828 5.58891 10.9476 5.87391 10.9476 6.17031C10.9476 6.47241 10.8337 6.75171 10.6287 6.96831L10.6116 6.98541L9.63757 7.96011L10.378 8.70112L11.3805 7.69791C12.2121 6.84861 12.2064 5.48061 11.3634 4.63701C10.5204 3.7934 9.15911 3.7877 8.30472 4.61991L7.29653 5.61741L8.03701 6.35841ZM8.69204 10.3769L7.95157 9.63592L7.71804 9.87532L6.97756 10.6163L6.97186 10.622C6.53328 11.0609 5.81559 11.0552 5.377 10.6163C4.93841 10.1774 4.93841 9.46492 5.3713 9.02032L5.377 9.01462L6.11747 8.27361L6.3567 8.03421L5.61623 7.29321L4.64222 8.27931L4.63652 8.28502C3.78783 9.13432 3.78783 10.5137 4.63652 11.363C5.48522 12.2123 6.86364 12.2123 7.71234 11.363L7.71804 11.3573L8.69204 10.3769ZM9.93946 10.7588L5.22321 6.04491C5.17381 5.99478 5.14612 5.92721 5.14612 5.85681C5.14612 5.78641 5.17381 5.71884 5.22321 5.66871L5.70167 5.18991C5.75176 5.14048 5.81928 5.11277 5.88963 5.11277C5.95998 5.11277 6.02751 5.14048 6.0776 5.18991L10.7882 9.90382C10.8907 10.0064 10.8907 10.1774 10.7882 10.28L10.3097 10.7588C10.2072 10.8671 10.042 10.8671 9.93946 10.7588Z" fill="#7E8A93" />
                            <path d="M8.03701 6.35841L9.01102 5.38371L9.0281 5.36661C9.24455 5.15571 9.52365 5.04171 9.82554 5.04741C10.1274 5.04741 10.4065 5.16711 10.6173 5.37801C10.828 5.58891 10.9476 5.87391 10.9476 6.17031C10.9476 6.47241 10.8337 6.75171 10.6287 6.96831L10.6116 6.98541L9.63757 7.96011L10.378 8.70112L11.3805 7.69791C12.2121 6.84861 12.2064 5.48061 11.3634 4.63701C10.5204 3.7934 9.15911 3.7877 8.30472 4.61991L7.29653 5.61741L8.03701 6.35841ZM8.69204 10.3769L7.95157 9.63592L7.71804 9.87532L6.97756 10.6163L6.97186 10.622C6.53328 11.0609 5.81559 11.0552 5.377 10.6163C4.93841 10.1774 4.93841 9.46492 5.3713 9.02032L5.377 9.01462L6.11747 8.27361L6.3567 8.03421L5.61623 7.29321L4.64222 8.27931L4.63652 8.28502C3.78783 9.13432 3.78783 10.5137 4.63652 11.363C5.48522 12.2123 6.86364 12.2123 7.71234 11.363L7.71804 11.3573L8.69204 10.3769ZM9.93946 10.7588L5.22321 6.04491C5.17381 5.99478 5.14612 5.92721 5.14612 5.85681C5.14612 5.78641 5.17381 5.71884 5.22321 5.66871L5.70167 5.18991C5.75176 5.14048 5.81928 5.11277 5.88963 5.11277C5.95998 5.11277 6.02751 5.14048 6.0776 5.18991L10.7882 9.90382C10.8907 10.0064 10.8907 10.1774 10.7882 10.28L10.3097 10.7588C10.2072 10.8671 10.042 10.8671 9.93946 10.7588Z" fill="black" />
                        </svg>
                    </div>

                </div>

               <Copyed value={address}/>
                    

                </div> : <div onClick={() => {
                    login()
                }} style={{ color: title === 'From' ? '#FF7A00' : '#8000FF' }} className={styles.connect}>Connect</div>
            }
            {
                showLayer && <div className={styles.accountLayer}></div>
            }

        </div>

        <div className={styles.inputWrapper}>
            <input className={styles.input} placeholder="0" type="number" value={amount} disabled={inputDisbaled} onChange={e => {
                if (!inputDisbaled && onAmountChange) {
                    const value = e.target.value;
                    const decimalParts = value.split('.');
                    if (decimalParts.length > 1 && decimalParts[1].length > 8) {
                        return;
                    }
                    onAmountChange(e.target.value)
                }
            }} />
            <div className={styles.tokenWrapper}>
                {chain === chains.near ? (
                    <DropDown 
                        position='right'
                        render={renderTokenOptions}
                    >
                        <div className={styles.selectedToken}>
                            <Image 
                                src={selectedToken === 'BTC' ? '/imgs/layout/header/nbtc.svg' : '/imgs/layout/header/abtc.svg'} 
                                alt={selectedToken} 
                                width={22} 
                                height={22} 
                            />
                            <span>{selectedToken}</span>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </DropDown>
                ) : (
                    <>
                        <Image 
                            src={chain === chains.btc ? '/imgs/layout/header/bitcoin.webp' : '/imgs/layout/header/nbtc.svg'} 
                            alt={chain.name} 
                            width={22} 
                            height={22} 
                            className={styles.tokenImg} 
                        />
                        <div className={styles.tokenName}>BTC</div>
                    </>
                )}
            </div>
        </div>

        <div className={styles.values}>
            <div className={styles.valuePrice}>{amount && Number(amount) > 0 ? '($' + balanceFormated(Number(amount) * prices.BTC, 2) + ')' : '~'}</div>
            <div className={styles.balance} style={{ cursor: inputDisbaled ? 'default' : 'cursor' }} onClick={async () => {
                let maxVal = balance
                if (getMax && isNear(chain)) {
                    maxVal = await getMax()
                }

                if (getMax && isBtc(chain)) {
                    maxVal = await getMax()
                }

                console.log('balance:',balance)

                !inputDisbaled && balance && onAmountChange && onAmountChange(maxVal ? balanceFormated(maxVal, 8) : maxVal as string)
            }}>Balance: <span style={{ textDecoration: inputDisbaled ? 'none' : 'underline' }} className={styles.balanceValue}>{(balance !== null && address) ? balanceFormated(balance, 8) : '~'}</span></div>
            {
                showLayer && <div className={styles.balanceLayer}></div>
            }
        </div>

        {
            isError && <div className={styles.errorMsg}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_5223_2921)">
                        <path d="M5 0C2.23875 0 0 2.23875 0 5C0 7.76125 2.23875 10 5 10C7.76125 10 10 7.76125 10 5C10 2.23875 7.76125 0 5 0ZM5 0.833333C7.30125 0.833333 9.16667 2.69875 9.16667 5C9.16667 7.30125 7.30125 9.16667 5 9.16667C2.69875 9.16667 0.833333 7.30125 0.833333 5C0.833333 2.69875 2.69875 0.833333 5 0.833333ZM4.58333 5.41667C4.58333 5.52717 4.62723 5.63315 4.70537 5.71129C4.78351 5.78943 4.88949 5.83333 5 5.83333C5.11051 5.83333 5.21649 5.78943 5.29463 5.71129C5.37277 5.63315 5.41667 5.52717 5.41667 5.41667V2.5C5.41667 2.38949 5.37277 2.28351 5.29463 2.20537C5.21649 2.12723 5.11051 2.08333 5 2.08333C4.88949 2.08333 4.78351 2.12723 4.70537 2.20537C4.62723 2.28351 4.58333 2.38949 4.58333 2.5V5.41667ZM4.95833 6.75C4.80362 6.75 4.65525 6.81146 4.54585 6.92085C4.43646 7.03025 4.375 7.17862 4.375 7.33333C4.375 7.48804 4.43646 7.63642 4.54585 7.74581C4.65525 7.85521 4.80362 7.91667 4.95833 7.91667C5.11304 7.91667 5.26142 7.85521 5.37081 7.74581C5.48021 7.63642 5.54167 7.48804 5.54167 7.33333C5.54167 7.17862 5.48021 7.03025 5.37081 6.92085C5.26142 6.81146 5.11304 6.75 4.95833 6.75Z" fill="#FF0F66" />
                    </g>
                    <defs>
                        <clipPath id="clip0_5223_2921">
                            <rect width="10" height="10" fill="white" transform="matrix(1 0 0 -1 0 10)" />
                        </clipPath>
                    </defs>
                </svg>

                <span>{errorMsg}</span>
            </div>
        }

        {/* {
            showLayer && <div className={styles.layer}></div>
        } */}

    </div>
}