import { useEffect, useRef, useState } from "react"
import { base_url } from "@/config";

export default function useStatus({
    hash,
    chainId,
    signature,
}: any) {
    const [isSuccess, setIsSuccess] = useState(false)
    const interRef = useRef<any>(null)
    const [apiHash, setApihash] = useState('')

    useEffect(() => {
        if ((hash && chainId) || signature) {

            if (interRef.current) {
                clearInterval(interRef.current)
            }

            interRef.current = setInterval(() => {
                let url = ''
                if (signature && !hash) {
                    url = `${base_url}/btcTx?sig=${signature}`
                } else {
                    url = `${base_url}/bridgeFromTx?fromTxHash=${hash}&fromChainId=${chainId}`
                }

                fetch(url)
                .then(res => res.json())
                .then((res: any) => {
                    
                    if (res.result_data && res.result_data.NearHash) {
                        setApihash(res.result_data.NearHash)
                    }

                    if (res.result_data && res.result_data.Status === 4) {
                        setIsSuccess(true)
                    } else {
                        setIsSuccess(false)
                    }

                })
            }, 10000)
    
            return () => {
                clearInterval(interRef.current)
            }
        }
    }, [hash, chainId, signature])

    return {
        isSuccess,
        hash: hash || apiHash,
    }
}