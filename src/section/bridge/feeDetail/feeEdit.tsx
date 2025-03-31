import Modal from "@/component/modal";

import styles from './fee.edit.module.css'
import Btn from "@/component/btn";
import { useFeeRate } from "@/hook/useFeeRate";
import { useState } from "react";

interface Props {
    onClose: () => void;
}

export default function FeeEdit({
    onClose
}: Props) {
    // @ts-ignore
    const { set, fees, feeRate, feeIndex } = useFeeRate()
    const [_feeIndex, setFeeIndex] = useState(feeIndex)

    return <Modal onClose={onClose}>
        <div>Edit Fee</div>
        <div className={styles.fees}>
            {
                fees.map((item: any, index: number) => {
                    return <div key={item.name} onClick={() => {
                        setFeeIndex(index)
                    }} className={styles.feeItem + (_feeIndex === index ? ' ' + styles.feeItemActive : '')}>
                        <div className={styles.feeTitle}>{item.name}</div>
                        {
                            index === fees.length - 1 
                            ? <div className={styles.feeInputAmount}>
                                <input className={ styles.feeInput } value={ item.value } onChange={(e) => {
                                    if (!isNaN(Number(e.target.value))) {
                                        item.value = Number(e.target.value)
                                        set({
                                            fees: [...fees]
                                        })
                                    }
                                    
                                }}/> sat/vb
                            </div>
                            : <div className={styles.feeAmount}>{item.value} sat/vb</div> 
                        }
                        
                    </div>
                })
            }
        </div>

        <div style={{ height: 50 }}></div>
        <Btn text="Confirm" onClick={() => {
            set({
                feeIndex: _feeIndex,
                feeRate: fees[_feeIndex].value,
            }) 
            onClose()
        }}/>
    </Modal>
}