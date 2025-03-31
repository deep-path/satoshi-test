import Big from 'big.js'

export function parseAmount(amount: string | number | undefined, decimals = 24) {
    if (!amount) return '';
    try {
      return new Big(amount).times(Big(10).pow(decimals)).toFixed(0, Big.roundDown);
    } catch (error) {
      return '';
    }
  }

  export function safeJSONParse<T>(str: string): T | undefined {
    try {
      return JSON.parse(str) as T;
    } catch (e) {
      console.error('safeJSONParse', e);
      return undefined;
    }
  }


  export function generateUrl(
    url = '',
    query: Record<string, any>,
    hashes: Record<string, any> = {},
  ) {
    const queryStringParts = [];
    for (const key in query) {
      const value = query[key];
      if ([undefined, null, ''].includes(value)) continue;
      if (Array.isArray(value)) {
        value.forEach((_value) => {
          queryStringParts.push(encodeURIComponent(key) + '[]=' + encodeURIComponent(_value));
        });
      } else {
        queryStringParts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
      }
    }
    const queryString = queryStringParts.join('&');
    if (queryString) {
      url += url.includes('?') ? '&' : '?';
      url += queryString;
    }
  
    const hashStringParts = [];
    for (const key in hashes) {
      const value = hashes[key];
      if ([undefined, null, ''].includes(value)) continue;
      hashStringParts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }
    const hashString = hashStringParts.join('&');
    if (hashString) {
      url += '#' + hashString;
    }
  
    return url;
  }



export function formatAmount(amount: string | number | undefined, decimals = 24) {
    if (!amount) return '';
    try {
      const n = new Big(amount).div(Big(10).pow(decimals)).toFixed();
      return n;
    } catch (error) {
      return '';
    }
  }


  export function uint8ArrayToHex(uint8Array: any) {
      return Array.from(uint8Array)
          .map((byte: any) => byte.toString(16).padStart(2, '0'))
          .join('');
  }