export default {
    btc: {
        name: 'BTC',
        icon: '/imgs/layout/header/btc.svg'
    },
    near: {
        name: 'NEAR',
        icon: '/imgs/layout/header/near.svg'
    }
} as {
    [key: string] : Chain
}

export type Chain = {
    name: string;
    icon: string;
}