import Modal from "@/component/modal";
import styles from './confirmBox.module.css'

import chains from "@/util/chains";
import Link from "next/link";

import type { Chain } from "@/util/chains";

interface Props {
    onClose: () => void;
    fromChain: Chain;
    toChain: Chain;
    status: number;
    hash: string;
}

export default function ComfirmBox({ onClose, status, fromChain, toChain, hash }: Props) {
    return <Modal onClose={onClose}>
        <div className={styles.title}>Transaction Detail</div>
        <div className={styles.chians}>
            <img style={{ width: 26, height: 26 }} src={fromChain?.icon} />
            <svg width="31" height="2" viewBox="0 0 31 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line opacity="0.5" x1="8.74228e-08" y1="1" x2="31" y2="1" stroke="#727272" stroke-width="2" stroke-dasharray="2 5" />
            </svg>

            {
                status === 0 ? <svg className={styles.loading} width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M52.0766 10.7867C53.0482 11.0471 53.6273 12.0399 53.3741 13.0134C53.1219 13.977 52.1361 14.5546 51.1725 14.3024L47.6172 13.3498L46.3268 18.1657C44.8261 23.7665 40.0219 27.6146 34.2721 28.6546C38.7381 32.4056 40.9681 38.1648 39.4673 43.7656L38.1769 48.5815L41.6972 49.5248C42.6655 49.7843 43.2401 50.7794 42.9806 51.7477C42.7212 52.7159 41.726 53.2905 40.7578 53.031L2.02593 42.6529L1.71657 42.5396C0.800668 42.1375 0.383843 41.0689 0.785965 40.153C1.15472 39.3126 2.09436 38.8809 2.97262 39.1481L6.52126 40.0989L7.81144 35.2839C9.31216 29.6832 14.1131 25.8341 19.8661 24.795C15.3968 21.0432 13.1702 15.2848 14.6709 9.68407L15.9615 4.86764L12.4128 3.91679C11.4445 3.65734 10.87 2.66223 11.1295 1.69395C11.3889 0.725662 12.384 0.151138 13.3523 0.410589L52.0766 10.7867ZM44.0959 12.4063L19.471 5.80801L18.1871 10.5994C17.0693 14.7711 18.671 19.3131 22.2022 22.3268C23.2549 23.2994 23.6544 24.61 23.3544 25.7297C23.0485 27.0126 21.9665 27.9627 20.6551 28.1007C16.1146 28.9516 12.432 32.0776 11.3175 36.2502L10.0214 41.0874L11.982 41.6127L12.5291 39.571C13.5385 35.8039 16.032 32.0464 21.0065 30.689L21.8135 30.4937C23.6047 30.2306 25.3145 29.1151 26.9388 27.1507C27.1931 29.441 28.1726 31.2771 29.8857 32.6567C34.4351 36.8 34.1706 41.1245 33.1094 45.0849L32.5623 47.1267L34.6428 47.6841L35.9323 42.8715C37.0501 38.6998 35.4522 34.1588 31.9215 31.1412C30.8693 30.1687 30.4684 28.8613 30.7693 27.7383C31.1136 26.4535 32.114 25.5215 33.4676 25.3711C38.0072 24.5235 41.6865 21.3966 42.8052 17.2216L44.0959 12.4063ZM40.7578 15.6185C40.1797 19.9295 35.6431 22.9023 32.7256 23.2863C30.9809 23.5169 29.1741 24.3456 27.3087 25.7742C26.4809 23.6244 25.3731 22.0143 23.9948 20.9474C21.5041 19.0198 20.6551 17.2216 20.3797 15.1185L40.7578 15.6185Z" fill="white" fill-opacity="0.21" />
                </svg> : <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="27" cy="27" r="21" fill="#33FFDA" />
                    <circle cx="27" cy="27" r="24" stroke="#33FFDA" stroke-opacity="0.3" stroke-width="6" />
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M37.342 19.6604C38.2111 20.5494 38.2205 22.0006 37.363 22.9016L24.8987 36L17.651 28.5196C16.7858 27.6266 16.7826 26.1754 17.6439 25.2783C18.5052 24.3813 19.9048 24.378 20.77 25.271L24.8705 29.5031L34.2159 19.6822C35.0733 18.7812 36.4729 18.7714 37.342 19.6604Z" fill="black" />
                </svg>
            }

            <svg width="31" height="2" viewBox="0 0 31 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line opacity="0.5" x1="8.74228e-08" y1="1" x2="31" y2="1" stroke="#727272" stroke-width="2" stroke-dasharray="2 5" />
            </svg>
            <img style={{ width: 26, height: 26 }}  src={toChain?.icon} />
        </div>

        {
            status === 0 && <>
                <div className={styles.time}>
                    Est. Bridging Time: 20 mins
                </div>
                <div className={styles.processing}>
                    Transaction is processing. You can track your transaction on the <Link href="/history">bridge transaction history.</Link>
                </div>
            </>
        }

        {
            status === 1 && <>
                <div className={styles.time}>
                    Bridge Completed
                </div>
                <div className={styles.processing}>
                    You can view your transaction on the <Link href="/history">bridge transaction history.</Link>
                </div>
            </>
        }

        {
            !!hash && <><div className={styles.srcBtn} onClick={() => {
                if (fromChain.name === 'BTC') {
                    const network = process.env.NEXT_PUBLIC_BTC_NET || 'testnet';
                    window.open(`https://blockstream.info/${network === 'mainnet' ? '' : 'testnet/'}tx/${hash}`)
                } else if (fromChain.name === 'NEAR') {
                    const network = process.env.NEXT_PUBLIC_NEAR_NET || 'testnet';
                    window.open(`https://${network === 'mainnet' ? '' : 'testnet.'}nearblocks.io/txns/${hash}`)
                }

            }}>
                SRC TX <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M5.97871 8H2.02129C0.907217 8 0 7.09294 0 5.97905V2.02095C0 0.907063 0.907217 0 2.02129 0H3.73973C3.98175 0 4.17779 0.196012 4.17779 0.437986C4.17779 0.679959 3.98175 0.875972 3.73973 0.875972H2.02129C1.71573 0.875972 1.42775 0.994931 1.21142 1.21122C0.995099 1.42751 0.87612 1.71544 0.87612 2.02095V5.97769C0.87612 6.2832 0.995099 6.57114 1.21142 6.78743C1.42775 7.00372 1.71573 7.12268 2.02129 7.12268H5.97871C6.61011 7.12268 7.12388 6.60899 7.12388 5.97769V4.12977C7.12388 3.97432 7.20771 3.82832 7.34291 3.74992C7.40916 3.71206 7.48487 3.69179 7.56194 3.69179C7.63901 3.69179 7.71472 3.71206 7.78097 3.74992C7.91617 3.82832 8 3.97296 8 4.12977V5.97769C8 7.09294 7.09414 8 5.97871 8ZM7.35223 2.78066C7.41578 2.81715 7.48879 2.83608 7.56179 2.83608C7.6348 2.83608 7.70781 2.8158 7.77271 2.7793C7.90251 2.70496 7.98228 2.56572 7.98228 2.41702V0.438001C7.98228 0.206844 7.79434 0.0189453 7.56315 0.0189453H5.58378C5.35258 0.0189453 5.16465 0.206844 5.16465 0.438001C5.16465 0.669157 5.35258 0.857056 5.58378 0.857056H6.55077L3.70328 3.70405L3.70058 3.70676C3.62658 3.7861 3.58634 3.89111 3.58835 3.99958C3.59037 4.10806 3.6345 4.21149 3.7114 4.28803C3.79117 4.36779 3.89527 4.41105 4.00749 4.41105C4.1143 4.41105 4.2157 4.37049 4.29277 4.29885L4.29412 4.2975L7.14267 1.44944V2.41838C7.14267 2.56707 7.22379 2.70631 7.35223 2.78066Z" fill="#FF7A00" />
                </svg>
            </div>
            </>
        }

        {
            status === 1 &&
            <button onClick={() => {
                onClose && onClose()
            }} className={styles.btn}>+ New Transfer</button>
        }

    </Modal>
}