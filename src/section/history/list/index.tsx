"use client"

import { memo, useEffect, useMemo, useState } from "react";
import Image from 'next/image'
import styles from './list.module.css'
import './table.css'

import chains from '@/util/chains'
import useAccount, { isNear, isBtc } from '@/hook/useAccount'
import { formatAddress, formateTxDate, balanceFormated } from '@/util/'

import { useList } from '../hooks/useList'
import Big from "big.js";
import { viewMethod } from "@/hook/useNear";
import { usePrice } from "@/hook/usePrice";

const icons: any = {
    1: <Image src={chains.btc.icon} width={26} height={26} alt='btc' />,
    2: <Image src={chains.near.icon} width={26} height={26} alt='near' />
}

const miniIcons: any = {
    1: <Image src={chains.btc.icon} width={32} height={32} alt='btc' />,
    2: <Image src={chains.near.icon} width={32} height={32} alt='near' />
}

const scanBtcUrl = process.env.NEXT_PUBLIC_BTC_NET === 'testnet' ? 'https://blockstream.info/testnet' : 'https://blockstream.info'
const scanNearUrl = process.env.NEXT_PUBLIC_NEAR_NET === 'testnet' ? 'https://testnet.nearblocks.io' : 'https://nearblocks.io'

const linkPrefix: any = {
    1: `${scanBtcUrl}/tx/`,
    2: `${scanNearUrl}/txns/`
}

interface Props {
    searchText: string;
    onTotalChange: (V: any) => void;
}

function formatMoney(amount: string | number, prices: any) {
    if (!amount) {
        return '0'
    }
    return new Big(amount).div(10 ** 8).mul(prices.BTC).toFixed(2)
}

const page_size = 10

export default function List({ searchText, onTotalChange }: Props) {
    const [fromChainId, setFromChainId] = useState('1')
    const [filterList, setFilterList] = useState([])
    const [pageList, setPageList] = useState([])
    const [pageNum, setPageNum] = useState(1)
    const [inputPageNum, setInputPageNum] = useState('')
    const [totalPage, setTotalPage] = useState(0)
    const [depositFee, setDepositFee] = useState<any>(0)

    const { prices }: any = usePrice()

    const { walletType, nearLogin, btcLogin, account, nearAccount, btcAccount } = useAccount()

    const { list } = useList({
        fromChainId,
        fromAddress: account as string,
    })

    useEffect(() => {
        viewMethod({
            method: 'get_config',
            args: {}
        }).then((metaData) => {
            if (metaData?.deposit_bridge_fee?.fee_min) {
                setDepositFee(Number(metaData?.deposit_bridge_fee?.fee_min))
            }
        })
    }, [])
    


    useEffect(() => {
        if (isBtc(walletType)) {
            setFromChainId('1')
        } else if (isNear(walletType)) {
            setFromChainId('2')
        }
    }, [walletType])

    useEffect(() => {
        if (filterList) {
            onTotalChange(filterList.length)
        } else {
            onTotalChange(0)
        }
    }, [filterList])

    useEffect(() => {
        if (filterList) {
            const pageList = filterList.slice((pageNum - 1) * page_size, pageNum * page_size)
            setPageList(pageList)
            setTotalPage(Math.ceil(filterList.length / page_size))
        }
    }, [filterList, pageNum])

    useEffect(() => {
        if (searchText) {
            const _filterList = list.filter((item: any) => {
                if (item.FromTxHash.indexOf(searchText) > -1) {
                    return true
                }

                if (item.ToTxHash?.indexOf(searchText) > -1) {
                    return true
                }

                return false
            })

            setFilterList(_filterList)
        } else {
            setFilterList(list)
        }

    }, [searchText, list])

    const isLogin = useMemo(() => {
        if (!account) {
            return false
        }
        return true
    }, [walletType, nearAccount, btcAccount, account])

    return <div className={styles.bg}>
        <div className={styles.wrapper}>
            <div style={{ height: 600 }}>
                <table className='history-table'>
                    <thead>
                        <tr>
                            <th style={{ width: 230, paddingLeft: 10 }}>Time</th>
                            <th style={{ width: 120 }}>Direction</th>
                            <th style={{ width: 160 }}>Amount</th>
                            <th style={{ width: 130 }}>Fee</th>
                            <th style={{ width: 160 }}>Sending Tx</th>
                            <th style={{ width: 160 }}>Receiving Tx</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            (!filterList || !filterList.length) &&
                            <tr className="no-data-tr" >
                                <td className={styles.noData} colSpan={6}>
                                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g opacity="0.5">
                                            <path d="M35.9145 20.7619L31.4123 3.88012C31.2768 3.41098 30.9929 2.99845 30.603 2.7045C30.2131 2.41055 29.7383 2.25106 29.25 2.25H6.75C5.74875 2.25 4.86 2.9205 4.58775 3.88012L0.0855 20.7619C0.0291382 20.9614 0.000370839 21.1677 0 21.375L0 29.25C0 30.4435 0.474106 31.5881 1.31802 32.432C2.16193 33.2759 3.30653 33.75 4.5 33.75H31.5C32.6935 33.75 33.8381 33.2759 34.682 32.432C35.5259 31.5881 36 30.4435 36 29.25V21.375C36 21.1725 35.9719 20.9666 35.9145 20.7619ZM33.75 29.25C33.75 30.4897 32.7397 31.5 31.5 31.5H4.5C3.25912 31.5 2.25 30.4897 2.25 29.25V21.375L6.75112 4.49888H29.2477L33.75 21.375V29.25Z" fill="#7E8A93" />
                                            <path d="M26.7099 6.75H9.29035C8.78073 6.75 8.3341 7.09313 8.20247 7.58588L4.32685 21.0859C4.28256 21.2524 4.27712 21.4269 4.31097 21.5959C4.34481 21.7649 4.41703 21.9239 4.52204 22.0605C4.62706 22.1972 4.76207 22.3079 4.91665 22.3841C5.07123 22.4603 5.24126 22.4999 5.4136 22.5H10.5526L12.1805 25.7569C12.3678 26.1304 12.6554 26.4445 13.011 26.6641C13.3666 26.8836 13.7763 26.9999 14.1942 27H21.806C22.6587 27 23.4361 26.5185 23.8186 25.7569L25.4465 22.5H30.5855C30.758 22.5001 30.9283 22.4606 31.0832 22.3844C31.238 22.3082 31.3732 22.1974 31.4784 22.0606C31.5835 21.9238 31.6558 21.7646 31.6896 21.5954C31.7234 21.4262 31.7179 21.2515 31.6733 21.0848L27.7977 7.58475C27.7337 7.34517 27.5924 7.13343 27.3957 6.98247C27.1989 6.83152 26.9578 6.74979 26.7099 6.75ZM27.3162 20.25H25.4465C24.5892 20.25 23.8186 20.7247 23.4339 21.4931L21.806 24.75H14.1942L12.5663 21.4931C12.3805 21.1186 12.0935 20.8036 11.7377 20.5839C11.382 20.3641 10.9718 20.2485 10.5537 20.25H6.00085L9.29035 7.875H26.7099L29.9994 20.25H27.3162Z" fill="#7E8A93" />
                                        </g>
                                    </svg>
                                    <div className={styles.text}>No Result</div>
                                    {
                                        !isLogin ? <div onClick={() => {
                                            isBtc(walletType) ? btcLogin() : nearLogin()
                                        }} className={styles.connect}>Connect {walletType.name} Wallet</div> : null
                                    }
                                </td>
                            </tr>
                        }
                        {
                            pageList && pageList.map((item: any, index) => {
                                return <tr key={item.Id}>
                                    <td style={{ paddingLeft: 10 }}>{formateTxDate(item.CreateTime * 1000)}</td>
                                    <td>
                                        {
                                            icons[item.FromChainId]
                                        }
                                        <svg style={{ position: 'relative', top: -10, margin: '0 5px' }} width="14" height="5" viewBox="0 0 14 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M13.0185 4.66665H0.981563C0.439 4.66665 4.29153e-05 4.2763 4.29153e-05 3.79381C4.29153e-05 3.31133 0.439 2.92098 0.981563 2.92098H10.6356L9.02696 1.49049C8.64254 1.14863 8.64254 0.595833 9.02696 0.256396C9.41139 -0.0854654 10.033 -0.0854654 10.4147 0.256396L13.6101 3.09554C13.8473 3.25556 14 3.50772 14 3.79381C14 4.2763 13.561 4.66665 13.0185 4.66665Z" fill="#7E8A93" />
                                        </svg>
                                        {
                                            icons[item.ToChainId]
                                        }
                                    </td>
                                    <td>
                                        <div className='token-amount'>
                                            {
                                                isBtc(walletType) 
                                                ? <><span className="amount">{balanceFormated((Number(item.Amount) - (Number(item.BridgeFee) > 0 ? Number(item.BridgeFee) : depositFee)) / (10 ** 8), 8)}</span> BTC</>
                                                : <><span className="amount">{balanceFormated((Number(item.Amount)) / (10 ** 8), 8)}</span> BTC</>
                                            }
                                        </div>
                                    </td>
                                    <td>
                                        <div className="l-fee">
                                            ${formatMoney(Number(item.GasFee) + (Number(item.BridgeFee) > 0 ? Number(item.BridgeFee) : depositFee), prices)}<div className="fee-dot" style={{ zIndex: 9999 - index }}>
                                                ...
                                                <div className="fee-dot-layer">
                                                    <div className="fee-dot-layer-item"> 
                                                        <div className="fee-dot-title">Gas Fee</div>
                                                        <div className="fee-dot-content">${formatMoney(item.GasFee, prices)}</div>
                                                    </div>
                                                    <div className="fee-dot-layer-item">
                                                        <div className="fee-dot-title">Bridge Fee
                                                        </div>
                                                        <div className="fee-dot-content">${formatMoney(Number(item.BridgeFee) > 0 ? Number(item.BridgeFee) : depositFee, prices)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div></td>
                                    <td>
                                        <div className="address">{formatAddress(item.FromAccount)}</div>
                                        <a href={`${linkPrefix[item.FromChainId]}${item.FromTxHash}`} target="_blank" className='tx'>Tx: {formatAddress(item.FromTxHash)}</a>
                                    </td>
                                    <td>
                                        {
                                            item.ToTxHash ? <><div>{formatAddress(item.ToAccount)}</div>
                                                <a href={`${linkPrefix[item.ToChainId]}${item.ToTxHash}`} target="_blank" className='tx'>Tx: {formatAddress(item.ToTxHash)}</a></> : '-'
                                        }
                                    </td>
                                    <td>

                                        {
                                            (item.Status === 4) && <div className='complete'><div>Completed</div>
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <circle cx="8" cy="8" r="8" fill="#FFD600" />
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5611 5.43072C11.8756 5.74103 11.879 6.24755 11.5687 6.56206L7.0578 11.1341L4.43482 8.52303C4.12169 8.21133 4.12054 7.7048 4.43225 7.39167C4.74395 7.07854 5.25048 7.07738 5.56361 7.38909L7.04759 8.86631L10.4297 5.43833C10.74 5.12381 11.2466 5.12041 11.5611 5.43072Z" fill="black" />
                                                </svg>

                                            </div>
                                        }

                                        {
                                            (item.Status !== 4) && <div>Progress</div>
                                        }
                                    </td>
                                </tr>
                            })
                        }
                    </tbody>
                </table>
            </div>
            {
                !!filterList?.length && <div className={styles.bottomLine} >
                    <div className={styles.total}>Per page: <div style={{ color: '#fff' }}>{pageNum}</div> / {totalPage}</div>
                    <div className={styles.page}>
                        <div className={styles.arrow} style={{ color: pageNum > 1 ? '#fff' : 'rgba(126, 138, 147, .3)' }} onClick={() => {
                            if (pageNum > 1) {
                                setPageNum(pageNum - 1)
                            }
                        }}>{'<<'}</div>
                        <div className={styles.pageItem}>{pageNum}</div>
                        <div className={styles.arrow} style={{ color: pageNum < totalPage ? '#fff' : 'rgba(126, 138, 147, .3)' }} onClick={() => {
                            if (pageNum < totalPage) {
                                setPageNum(pageNum + 1)
                            }
                        }}>{'>>'}</div>

                        <div className={styles.goTo}>
                            Go to
                        </div>
                        <input type="number" className={styles.goToInput} value={inputPageNum} onChange={(e) => {
                            const value = Number(e.target.value)
                            if (e.target.value === '') {
                                setInputPageNum('')
                                return
                            }
                            if (typeof value === 'number' && value % 1 === 0 && value >= 1 && value <= totalPage) {
                                setInputPageNum(e.target.value)
                            }
                        }} onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                if (inputPageNum) {
                                    setPageNum(Number(inputPageNum))
                                }
                            }
                        }}/>
                    </div>


                </div>
            }

        </div>

        <div className={styles.mini}>
            {(!filterList || !filterList.length) &&
                <div className={styles.miniNoData}>
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g opacity="0.5">
                            <path d="M35.9145 20.7619L31.4123 3.88012C31.2768 3.41098 30.9929 2.99845 30.603 2.7045C30.2131 2.41055 29.7383 2.25106 29.25 2.25H6.75C5.74875 2.25 4.86 2.9205 4.58775 3.88012L0.0855 20.7619C0.0291382 20.9614 0.000370839 21.1677 0 21.375L0 29.25C0 30.4435 0.474106 31.5881 1.31802 32.432C2.16193 33.2759 3.30653 33.75 4.5 33.75H31.5C32.6935 33.75 33.8381 33.2759 34.682 32.432C35.5259 31.5881 36 30.4435 36 29.25V21.375C36 21.1725 35.9719 20.9666 35.9145 20.7619ZM33.75 29.25C33.75 30.4897 32.7397 31.5 31.5 31.5H4.5C3.25912 31.5 2.25 30.4897 2.25 29.25V21.375L6.75112 4.49888H29.2477L33.75 21.375V29.25Z" fill="#7E8A93" />
                            <path d="M26.7099 6.75H9.29035C8.78073 6.75 8.3341 7.09313 8.20247 7.58588L4.32685 21.0859C4.28256 21.2524 4.27712 21.4269 4.31097 21.5959C4.34481 21.7649 4.41703 21.9239 4.52204 22.0605C4.62706 22.1972 4.76207 22.3079 4.91665 22.3841C5.07123 22.4603 5.24126 22.4999 5.4136 22.5H10.5526L12.1805 25.7569C12.3678 26.1304 12.6554 26.4445 13.011 26.6641C13.3666 26.8836 13.7763 26.9999 14.1942 27H21.806C22.6587 27 23.4361 26.5185 23.8186 25.7569L25.4465 22.5H30.5855C30.758 22.5001 30.9283 22.4606 31.0832 22.3844C31.238 22.3082 31.3732 22.1974 31.4784 22.0606C31.5835 21.9238 31.6558 21.7646 31.6896 21.5954C31.7234 21.4262 31.7179 21.2515 31.6733 21.0848L27.7977 7.58475C27.7337 7.34517 27.5924 7.13343 27.3957 6.98247C27.1989 6.83152 26.9578 6.74979 26.7099 6.75ZM27.3162 20.25H25.4465C24.5892 20.25 23.8186 20.7247 23.4339 21.4931L21.806 24.75H14.1942L12.5663 21.4931C12.3805 21.1186 12.0935 20.8036 11.7377 20.5839C11.382 20.3641 10.9718 20.2485 10.5537 20.25H6.00085L9.29035 7.875H26.7099L29.9994 20.25H27.3162Z" fill="#7E8A93" />
                        </g>
                    </svg>
                    <div className={styles.text}>No Result</div>
                    {
                        !isLogin ? <div onClick={() => {
                            isBtc(walletType) ? btcLogin() : nearLogin()
                        }} className={styles.connect}>Connect {walletType.name} Wallet</div> : null
                    }
                </div>
            }
            {
                pageList && pageList.map((item: any, index) => {
                    return <div key={item.Id} className={styles.miniPanel}>
                        <div className={styles.chains} >
                            <div className={styles.chain}>
                                {miniIcons[item.FromChainId]}
                            </div>
                            <div className={styles.miniDesc}>
                                <div className={styles.amount}>
                                    {/* <img className={styles.tokenImg} src="/imgs/layout/header/btc.svg" /> */}
                                    {
                                        isBtc(walletType) 
                                        ? <div className={styles.amountNum}>{balanceFormated((Number(item.Amount) - (Number(item.BridgeFee) > 0 ? Number(item.BridgeFee) : depositFee)) / (10 ** 8), 8)}</div>
                                        : <div className={styles.amountNum}>{balanceFormated(Number(item.Amount) / (10 ** 8), 8)}</div>
                                    }
                                    
                                    <div className={styles.tokenSymbol}>BTC</div>
                                </div>
                                <div className={styles.miniArrow}>
                                    <svg width="44" height="5" viewBox="0 0 44 5" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M43.0185 4.66665H0.981567C0.439003 4.66665 4.57764e-05 4.2763 4.57764e-05 3.79381C4.57764e-05 3.31133 0.439003 2.92098 0.981567 2.92098H40.6356L39.027 1.49049C38.6425 1.14863 38.6425 0.595833 39.027 0.256396C39.4114 -0.0854654 40.033 -0.0854654 40.4147 0.256396L43.6101 3.09554C43.8473 3.25556 44 3.50772 44 3.79381C44 4.2763 43.561 4.66665 43.0185 4.66665Z" fill="#7E8A93" />
                                    </svg>
                                </div>
                                <div className={styles.time}>
                                    {formateTxDate(item.CreateTime * 1000)}
                                </div>

                            </div>
                            <div className={styles.chain}>
                                {miniIcons[item.ToChainId]}
                            </div>
                        </div>

                        <div className={styles.transDesc}>
                            <div className={styles.title}>Sending Tx:</div>
                            <div className={styles.transContent}>
                                {
                                    item.FromTxHash ? <>
                                        <div className={styles.address}>
                                            {formatAddress(item.FromAccount)}
                                        </div>
                                        <a href={`${linkPrefix[item.FromChainId]}${item.FromTxHash}`} target="_blank" className={styles.miniTx}>Tx: {formatAddress(item.FromTxHash)}</a>
                                    </> : '~'
                                }
                            </div>
                        </div>

                        <div className={styles.transDesc}>
                            <div className={styles.title}>Receiving Tx:</div>
                            <div className={styles.transContent}>
                                {
                                    item.ToTxHash ? <>
                                        <div className={styles.address}>
                                            {formatAddress(item.ToAccount)}
                                        </div>
                                        <a href={`${linkPrefix[item.ToChainId]}${item.ToTxHash}`} target="_blank" className={styles.miniTx}>Tx: {formatAddress(item.ToTxHash)}</a></> : '~'
                                }
                            </div>
                        </div>

                        <div className={styles.transDesc}>
                            <div className={styles.title}>Fee:</div>
                            <div className={styles.transContent}>
                                <div>${formatMoney(Number(item.GasFee) + (Number(item.BridgeFee) > 0 ? Number(item.BridgeFee) : depositFee), prices)}</div>
                                <div><span className={styles.title}>Gas:</span> ${formatMoney(item.GasFee, prices)} <span className={styles.title}>Bridge</span> ${formatMoney((Number(item.BridgeFee) > 0 ? Number(item.BridgeFee) : depositFee), prices)}</div>
                            </div>
                        </div>

                        <div className={styles.transDesc}>
                            <div className={styles.title}>Status:</div>
                            <div className={styles.transContent}>
                                {
                                    (item.Status === 4) && <div className={styles.complete}><div>Completed</div>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="8" cy="8" r="8" fill="#FFD600" />
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5611 5.43072C11.8756 5.74103 11.879 6.24755 11.5687 6.56206L7.0578 11.1341L4.43482 8.52303C4.12169 8.21133 4.12054 7.7048 4.43225 7.39167C4.74395 7.07854 5.25048 7.07738 5.56361 7.38909L7.04759 8.86631L10.4297 5.43833C10.74 5.12381 11.2466 5.12041 11.5611 5.43072Z" fill="black" />
                                        </svg>

                                    </div>
                                }

                                {
                                    (item.Status !== 4) && <div>Progress</div>
                                }
                            </div>
                        </div>
                    </div>
                })
            }

            {
                (filterList && filterList.length > 0) && <div className={styles.miniPage}>
                    <div className={styles.nimiPerWrapper}>
                        <div className={styles.miniFirst} onClick={() => {
                            setPageNum(1)
                        }}>
                            <svg width="9" height="10" viewBox="0 0 9 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path opacity={pageNum !==1 ? 1 : "0.4" } fill-rule="evenodd" clip-rule="evenodd" d="M1.5 8.75C1.5 9.16421 1.16421 9.5 0.75 9.5C0.335786 9.5 0 9.16421 0 8.75V0.75C0 0.335787 0.335787 0 0.75 0C1.16421 0 1.5 0.335787 1.5 0.75L1.5 8.75ZM4.81066 4.75L8.28033 8.21967C8.57322 8.51256 8.57322 8.98744 8.28033 9.28033C7.98744 9.57322 7.51256 9.57322 7.21967 9.28033L3.21967 5.28033L2.68934 4.75L3.21967 4.21967L7.21967 0.21967C7.51256 -0.0732231 7.98744 -0.0732231 8.28033 0.21967C8.57322 0.512563 8.57322 0.987437 8.28033 1.28033L4.81066 4.75Z" fill="white" />
                            </svg>
                        </div>

                        <div className={styles.miniFirst} onClick={() => {
                            if (pageNum > 1) {
                                setPageNum(pageNum - 1)
                            }
                        }}>
                            <svg width="11" height="10" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path opacity={pageNum > 1 ? 1 : "0.4" } fill-rule="evenodd" clip-rule="evenodd" d="M5.59099 8.21967C5.88388 8.51256 5.88388 8.98744 5.59099 9.28033C5.2981 9.57322 4.82322 9.57322 4.53033 9.28033L0.530331 5.28033L0 4.75L0.530331 4.21967L4.53033 0.21967C4.82323 -0.0732234 5.2981 -0.0732233 5.59099 0.21967C5.88388 0.512563 5.88388 0.987437 5.59099 1.28033L2.12132 4.75L5.59099 8.21967ZM10.591 8.21967C10.8839 8.51256 10.8839 8.98744 10.591 9.28033C10.2981 9.57322 9.82322 9.57322 9.53033 9.28033L5.53033 5.28033L5 4.75L5.53033 4.21967L9.53033 0.21967C9.82323 -0.0732234 10.2981 -0.0732233 10.591 0.21967C10.8839 0.512563 10.8839 0.987437 10.591 1.28033L7.12132 4.75L10.591 8.21967Z" fill="white" />
                            </svg>
                        </div>
                    </div>

                    <div><span style={{ color: '#FF7A00' }}>{pageNum}</span> / {totalPage}</div>

                    <div className={styles.nimiBehWrapper}>
                        <div className={styles.miniFirst} onClick={() => {
                            if (pageNum < totalPage) {
                                setPageNum(pageNum + 1)
                            }
                        }}>
                            <svg width="11" height="10" viewBox="0 0 11 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path opacity={pageNum < totalPage ? 1 : "0.4" } fill-rule="evenodd" clip-rule="evenodd" d="M5.40901 8.21967C5.11612 8.51256 5.11612 8.98744 5.40901 9.28033C5.7019 9.57322 6.17678 9.57322 6.46967 9.28033L10.4697 5.28033L11 4.75L10.4697 4.21967L6.46967 0.21967C6.17677 -0.0732234 5.7019 -0.0732233 5.40901 0.21967C5.11612 0.512563 5.11612 0.987437 5.40901 1.28033L8.87868 4.75L5.40901 8.21967ZM0.409009 8.21967C0.116116 8.51256 0.116116 8.98744 0.409009 9.28033C0.701901 9.57322 1.17678 9.57322 1.46967 9.28033L5.46967 5.28033L6 4.75L5.46967 4.21967L1.46967 0.21967C1.17677 -0.0732234 0.701901 -0.0732233 0.409008 0.21967C0.116115 0.512563 0.116115 0.987437 0.409008 1.28033L3.87868 4.75L0.409009 8.21967Z" fill="white" />
                            </svg>
                        </div>

                        <div className={styles.miniFirst} onClick={() => {
                            setPageNum(totalPage)
                        }}>
                            <svg width="9" height="10" viewBox="0 0 9 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path opacity={pageNum !== totalPage ? 1 : "0.4" } fill-rule="evenodd" clip-rule="evenodd" d="M7.5 8.75C7.5 9.16421 7.83579 9.5 8.25 9.5C8.66421 9.5 9 9.16421 9 8.75V0.75C9 0.335787 8.66421 0 8.25 0C7.83579 0 7.5 0.335787 7.5 0.75L7.5 8.75ZM4.18934 4.75L0.71967 8.21967C0.426777 8.51256 0.426777 8.98744 0.71967 9.28033C1.01256 9.57322 1.48744 9.57322 1.78033 9.28033L5.78033 5.28033L6.31066 4.75L5.78033 4.21967L1.78033 0.21967C1.48744 -0.0732231 1.01256 -0.0732231 0.719669 0.21967C0.426776 0.512563 0.426776 0.987437 0.719669 1.28033L4.18934 4.75Z" fill="white" />
                            </svg>

                        </div>
                    </div>
                </div>
            }

        </div>
    </div>
}