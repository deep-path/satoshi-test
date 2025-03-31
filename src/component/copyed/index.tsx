import { useState } from "react"
import styles from './style.module.css'

const defaultColor = '#808095'


export default function Copyed({ value }: { value: string }) {
    const [color, setColor] = useState(defaultColor)
    const [tipShow, setTipShow] = useState(false)
    const [tip, setTip] = useState('Copy')

    return <div className={styles.copy} onMouseEnter={() => {
        setColor('#fff')
        setTipShow(true)
        setTip('Copy')
    }} onMouseLeave={() => {
        setColor(defaultColor)
        setTipShow(false)
    }} onClick={async () => {
        try {
            await navigator.clipboard.writeText(value)
            setTipShow(true)
            setTip('Copied')
            setColor('rgba(255, 122, 0, 1)')
        } catch (e) {

        }
    }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="10.5" stroke={defaultColor} stroke-opacity="0.3" />
            <path d="M6 9.22266C6 8.67037 6.44772 8.22266 7 8.22266H13.5778C13.6882 8.22266 13.7778 8.3122 13.7778 8.42266V15.0004C13.7778 15.5527 13.3301 16.0004 12.7778 16.0004H7C6.44772 16.0004 6 15.5527 6 15.0004V9.22266Z" stroke={color} stroke-width="1.2" />
            <path d="M9.3335 6H15.0002C15.5524 6 16.0002 6.44772 16.0002 7V13.7778" stroke={color} stroke-width="1.2" />
        </svg>

        {
            tipShow && <div className={styles.tip}>{ tip }</div>
        }

    </div>
}