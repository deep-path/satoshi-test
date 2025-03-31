import Big from 'big.js';
import { address } from 'bitcoinjs-lib'

const addressReg = /^(.{5}).*(.{5})$/
export function formatAddress(address: string) {
    if (!address) {
        return ''
    }

    if (address.length > 12) {
        return address.replace(addressReg, ($1, $2, $3) => {
            return $2 + '....' + $3
        })
    }

    return address
}

export function balanceFormated(balance?: string | number, digits = 4) {
    if (!balance) return '0';
    const _balance = new Big(balance);
    if (_balance.eq(0)) return '0';
    if (_balance.lt(1 / 10 ** digits)) return `<${1 / 10 ** digits}`;
    const val = _balance.toFixed(digits)

    return val.replace(/(\.?)0+$/, '');
}

export function formatDateTime(_datetime: any, formatStr: string = 'YYYY-MM-DD hh:mm:ss') {
    if (!_datetime) return '';
    const datetime = new Date(_datetime);
    const values: any = {
        'M+': datetime.getMonth() + 1,
        'D+': datetime.getDate(),
        'h+': datetime.getHours(),
        'm+': datetime.getMinutes(),
        's+': datetime.getSeconds(),
        'S': datetime.getMilliseconds(),
    };
    let fmt = formatStr;
    const reg = /(Y+)/;
    if (reg.test(fmt)) {
        const y = (reg.exec(fmt) as string[])[1];
        fmt = fmt.replace(y, (datetime.getFullYear() + '').substring(4 - y.length));
    }
    for (const k in values) {
        const regx = new RegExp('(' + k + ')');
        if (regx.test(fmt)) {
            const t = (regx.exec(fmt) as string[])[1];
            fmt = fmt.replace(t, (t.length === 1) ? (values[k]) : (('00' + values[k]).substring(('' + values[k]).length)));
        }
    }
    return fmt;
}

export function formateTxDate(_date: any) {
    if (!_date) return '';
    const monthsStr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const date = new Date(_date);
    const monthStr = monthsStr[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hour = date.getHours();
    const toTwo = (num: number) => (num >= 10 ? num : '0' + num);
    const hourStr = hour % 12;
    const minutes = date.getMinutes();
    const unit = hour > 11 ? 'PM' : 'AM';

    return `${monthStr} ${day}, ${year} ${toTwo(hourStr)}:${toTwo(minutes)} ${unit}`;
}

export async function getBtcFeeRate() {
    const rpcEndpoint = process.env.NEXT_PUBLIC_BTC_NET === 'testnet' ? `https://mempool.space/testnet` : `https://mempool.space`;
    const feeRes = await fetch(`${rpcEndpoint}/api/v1/fees/recommended`).then(res => res.json());

    return {
        fast: feeRes.fastestFee,
        avg: feeRes.halfHourFee,
        minimumFee: feeRes.hourFee,
    }
}

export async function getPrices() {
    const token = '2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near'
    const price = await fetch(`https://api.ref.finance/get-token-price?token_id=${token}`).then(res => res.json());

    return price
}

export function toHex(originalString: string) {
    let charArray = originalString.split('');
    let asciiArray = charArray.map(char => char.charCodeAt(0));
    let hexArray = asciiArray.map(code => code.toString(16));
    let hexString = hexArray.join('');
    hexString = hexString.replace(/(^0+)/g, '');
    return hexString
}


export function isBTCValidAddress(input: string) {
    try {
        const result = address.fromBech32(input)
        return !!result
    } catch (e) {
        try {
            const result = address.fromBase58Check(input)
            return !!result
        } catch (e) {

        }
    }
    return false
}

export function getBitcoinAddressType(address: string) {
    if (address.startsWith('1')) {
        return 'P2PKH'; // Pay-to-PubKey-Hash
    } else if (address.startsWith('3')) {
        return 'P2SH'; // Pay-to-Script-Hash
    } else if (address.startsWith('bc1p')) {
        return 'Taproot'; // Taproot (Bech32m)
    } else if (address.startsWith('bc1')) {
        return 'Bech32'; // Bech32 (SegWit)
    } else {
        return 'Unknown';
    }
}

export const isValidNearAddress = (address: string) => {
    return (
        /^[a-z0-9](?:[a-z0-9-_]*[a-z0-9])?\.(near|testnet)$/.test(address) ||
        /^[0-9a-fA-F]{64}$/.test(address)
    );
}