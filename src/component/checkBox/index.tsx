import { memo } from 'react';
import styles from './checkBox.module.css'

interface Props {
    checked?: boolean;
    onCheckChange?: (v: boolean) => void;
}

export default function CheckBox({
    checked,
    onCheckChange,
}: Props) {

    return <>
        {
            checked
                ? <div onClick={() => { 
                    onCheckChange && onCheckChange(false)
                 }} className={styles.wrapper + ' ' + styles.checked}>
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1 3.5L3.33333 6L8 1" stroke="#00022C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

                 </div>
                : <div onClick={() => { 
                    onCheckChange && onCheckChange(true)
                 }} className={styles.wrapper}></div>
        }
    </>
}