"use client"

import { useState } from "react"
import Header from "./header"
import List from './list'

export default function History() {
    const [searchText, setSearchText] = useState('')
    const [total, setTotal] = useState<any>(0)

    return <div>
        <Header onSearchTextChange={setSearchText} total={total} searchText={searchText}/>
        <List searchText={searchText} onTotalChange={(v) => {setTotal(v)}} />
    </div>
}