import { useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './dropdown.module.css'

interface Props {
    children?: ReactNode;
    render?: (data?: any) => ReactNode;
    needClickClose?: boolean;
    position?: 'center' | 'left' | 'right';
}

export default function DropDown({ 
    children, render, position = 'center', needClickClose = true
}: Props) {
    const [isHovering, setIsHovering] = useState(false)
    const [layerStyle, setLayerStyle] = useState({})
    const timeOutRef = useRef<any>(null)

    useEffect(() => {
        let layerStyle
        switch(position) {
            case 'center':
                layerStyle = {
                    left: '50%',
                    transform: 'translateX(-50%)'
                }
                break;
            case 'left':
                layerStyle = {
                    left: '0',
                }
                break;
            default:
                layerStyle = {
                    right: '0',
                }
        }

        setLayerStyle(layerStyle)
    }, [position])

    return <div className={ styles.wrapper } onMouseEnter={() => {
        if (timeOutRef.current) {
            clearTimeout(timeOutRef.current)
            timeOutRef.current = null
        }
        setIsHovering(true) 
    }} onMouseLeave={() => {
        timeOutRef.current = setTimeout(() => {
            setIsHovering(false)
            timeOutRef.current = null
        }, 800)
    }}>
        <div className={ styles.trigger }>
        { children }
        </div>
        <div className={ styles.layer } style={{ display: isHovering ? 'block' : 'none', ...layerStyle }} onClick={() => {
            needClickClose && setIsHovering(false)
        }}>
            { render && render() }
        </div>
    </div>
}