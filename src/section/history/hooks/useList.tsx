import { useEffect, useState } from "react";

import { base_url } from '@/config'

interface Props {
    fromChainId: string;
    fromAddress: string;
    page?: string;
    pageSize?: string;
}

export function useList({
    fromChainId,
    fromAddress,
    page = '1',
    pageSize = '10'
}: Props) {
    const [list, setList] = useState<any>(null)

    useEffect(() => {
        if (fromChainId && fromAddress && page && pageSize) {
            fetch(`${base_url}/history?fromChainId=${fromChainId}&fromAddress=${fromAddress}&page=${page}&pageSize=${pageSize}`)
                .then(res => res.json())
                .then(res => {
                    if (res.result_code === 0) {
                        setList(res.result_data)
                    }
                })

            
        } else {
            setList([])
        }

    }, [fromChainId, fromAddress, page, pageSize])

    return {
        list,
    }
}