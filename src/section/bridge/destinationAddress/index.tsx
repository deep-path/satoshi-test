import { useEffect, useState } from 'react';
import styles from './destinationAddress.module.css'

import CheckBox from '@/component/checkBox'
import type { Chain } from '@/util/chains';
import { isBtc, isNear } from '@/hook/useAccount';
import { isBTCValidAddress, isValidNearAddress } from '@/util';

import { getBalance } from '@/hook/useNear'

interface Props {
    enabled: boolean;
    onEnableChange: (v: boolean) => void;
    destiAddress: string;
    onDestiAddressChange: (v: string) => void;
    walletType: Chain,
    onValidChange: (v: boolean) => void;
}

export default function DestinationAddress({
    enabled, onEnableChange, destiAddress, onDestiAddressChange, walletType, onValidChange
}: Props) {
    const [isError, setIsError] = useState(false)
    const [isFocus, setIsFocus] = useState(false)
    const [isValid, setIsvalid] = useState(false)

    useEffect(() => {
        if (!enabled) {
            return
        }

        if (!destiAddress) {
            setIsvalid(false)
            return
        }

        if (isBtc(walletType)) {
            const isValid = isBTCValidAddress(destiAddress)
            // console.log(isValid)
            setIsvalid(isValid)
        } else if (isNear(walletType)) {
            const isValid = isValidNearAddress(destiAddress)
            setIsvalid(isValid)
            // getBalance(destiAddress).then(res => {
            //     console.log('res:', res)
            // }).catch(e => {
            //     console.log('e:', e)
            // })
        }

    }, [walletType, destiAddress, enabled])

    useEffect(() => {
        onValidChange(isValid)
    }, [isValid])

    return <div className={styles.wrapper} >
        <div className={styles.titleWrapper}>
            <CheckBox checked={enabled} onCheckChange={onEnableChange} />
            <div className={styles.title}>I{"'"}m transferring to a destination address</div>
        </div>
        {
            enabled && <div className={styles.addressWrapper} style={{
                border: isError
                    ? '1px solid rgba(255, 15, 102, 1)' :
                    (isFocus ? '1px solid rgba(255, 122, 0, 1)' : '0')
            }}>
                <input placeholder='Destination address' onBlur={() => {
                    if (enabled && (!destiAddress || destiAddress.trim() === '')) {
                        setIsError(true)
                    } else {
                        setIsError(false)
                        setIsFocus(false)
                    }

                }} onFocus={() => {
                    setIsFocus(true)
                }} className={styles.input} value={destiAddress} onChange={(e) => {
                    setIsError(false)
                    onDestiAddressChange(e.target.value)
                }} />

                {
                    (isValid ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="8" cy="8" r="8" fill="#8000FF" />
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5621 5.43072C11.8766 5.74103 11.88 6.24755 11.5697 6.56206L7.05878 11.1341L4.4358 8.52303C4.12267 8.21133 4.12152 7.7048 4.43322 7.39167C4.74493 7.07854 5.25146 7.07738 5.56459 7.38909L7.04856 8.86631L10.4307 5.43833C10.741 5.12381 11.2475 5.12041 11.5621 5.43072Z" fill="white" />
                    </svg> :
                        (
                            destiAddress && <svg style={{ cursor: 'pointer' }} onClick={() => {
                                onDestiAddressChange('')
                            }} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="8" cy="8" r="8" fill="#8000FF" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M10.3765 11.4372C10.6694 11.7301 11.1443 11.7301 11.4372 11.4372C11.7301 11.1443 11.7301 10.6694 11.4372 10.3765L9.13939 8.07873L11.4372 5.78093C11.7301 5.48804 11.7301 5.01317 11.4372 4.72027C11.1443 4.42738 10.6694 4.42738 10.3765 4.72027L8.07873 7.01807L5.78033 4.71967C5.48744 4.42678 5.01256 4.42678 4.71967 4.71967C4.42678 5.01256 4.42678 5.48744 4.71967 5.78033L7.01807 8.07873L4.71967 10.3771C4.42678 10.67 4.42678 11.1449 4.71967 11.4378C5.01256 11.7307 5.48744 11.7307 5.78033 11.4378L8.07873 9.13939L10.3765 11.4372Z" fill="white" />
                            </svg>
                        )
                    )
                }
                {/* {
                    (!destiAddress && !isFocus) && <div className={styles.paste} onClick={async () => {
                        const text = await navigator.clipboard.readText();
                        setIsError(false)
                        onDestiAddressChange(text)
                    }}>Paste</div>
                } */}



            </div>
        }
    </div>
}