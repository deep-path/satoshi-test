import Image from 'next/image'
import styles from './fee.module.css'

import { balanceFormated } from '@/util'
import { useEffect, useState } from 'react';
import FeeEdit from './feeEdit';

interface Props {
    gas: string | number | null;
    fee: string | number | null;
    time: string | number | null;
}

export default function Fee({
    gas, fee, time
}: Props) {
    const [totalFee, setTotalFee] = useState(0)
    const [feeEditShow, setFeeEditShow] = useState(false)

    useEffect(() => {
        let _fee = 0, _gas = 0
        if (fee) {
            _fee = Number(fee)
        }

        if (gas) {
            _gas = Number(gas)
        }

        const total = _fee + _gas
        setTotalFee(total)

    }, [fee, gas])

    return <div className={styles.wrapper}>
        <div className={styles.tokenIcon}>
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="34" height="34" rx="8" fill="#00022C" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M11.3013 8C10.8221 8 10.4103 8.33989 10.3194 8.81036L7.11489 25.4017C7.05531 25.7102 7.29164 25.9966 7.60581 25.9966H18.4612C20.8099 26.0691 23.7187 25.0071 24.7555 21.7972C25.695 18.8886 24.0979 17.1617 22.6888 16.5438C24.2858 16.2528 26.5405 14.0714 25.8829 11.363C25.2253 8.65462 22.6888 8 21.3735 8H11.3013ZM14.7293 12.5901C14.7814 12.4431 14.9242 12.3444 15.0848 12.3444H19.0482C19.1811 12.3444 19.272 12.4743 19.2226 12.5937L17.6723 16.3437H20.0637C20.2209 16.3437 20.3086 16.5194 20.2107 16.6386L15.1762 22.7666C15.05 22.9201 14.7967 22.7982 14.8471 22.6083L15.8811 18.7068H12.8247C12.6958 18.7068 12.6052 18.5841 12.647 18.4661L14.7293 12.5901Z" fill="white" />
                <rect width="34" height="34" rx="8" fill="#1C1C1C" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M27.9324 10L28.0176 24.0568L19.0575 24.148C15.5137 24.1841 12.6156 21.3327 12.5941 17.7888L12.5797 15.405L15.5327 15.3871L15.5472 17.7709C15.5587 19.6792 17.1192 21.2145 19.0275 21.1951L25.0468 21.1338L24.9974 12.9911L20.9341 13.0433L20.8961 10.0905L27.9324 10Z" fill="#FF7A00" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M5.08545 24.3096L5.00018 10.2528L14.4545 10.1565C17.7257 10.1232 20.4009 12.7552 20.4207 16.0266L20.4408 19.3486L17.4878 19.3665L17.4677 16.0445C17.4577 14.4088 16.1202 13.0928 14.4846 13.1095L7.97106 13.1758L8.02045 21.3185L12.0837 21.2662L12.1217 24.2191L5.08545 24.3096Z" fill="white" />
            </svg>

        </div>
        <div className={styles.feeContent}>
            <div className={styles.title}>Fee</div>
            <div className={styles.feeDetail}>
                <div className={styles.totalMoney}>${totalFee ? balanceFormated(totalFee, 2) : '-'}</div>
                <div className={styles.moneyDetail}>
                    <div className={styles.detailItem}>
                        <span className={styles.detailMoney}>${gas ? balanceFormated(gas, 2) : '-'}</span>
                        <span className={styles.detailDesc}>Gas</span>
                        <svg onClick={() => { setFeeEditShow(true) }} style={{ cursor: 'pointer' }} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="8" cy="8" r="8" fill="#FF7A00" />
                            <path d="M4.5 12L11.5 12L4.5 12Z" fill="#FF7A00" />
                            <path d="M4.5 12L11.5 12" stroke="black" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M4.7915 8.56665V10.0833H6.31592L10.6248 5.77252L9.10298 4.25L4.7915 8.56665Z" fill="#FF7A00" stroke="black" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.detailMoney}>${fee ? balanceFormated(fee, 2) : '-'}</span>
                        <span className={styles.detailDesc}>Fee</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.detailMoney}>~{time}</span>
                        <span className={styles.detailDesc}>Min</span>
                    </div>
                </div>
            </div>
        </div>

        {
            feeEditShow && <FeeEdit onClose={() => { setFeeEditShow(false) }}/>
        }
    </div>
}