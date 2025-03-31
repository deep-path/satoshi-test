
export interface QuerySwapParams {
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    pathDeep?: number;
    slippage?: number;
    routerCount?: number;
    tokenInDecimals?: number;
    tokenOutDecimals?: number;
  }

  export interface NearQuerySwapResponse {
    routes: {
      pools: {
        pool_id: string;
        token_in: string;
        token_out: string;
        amount_in: string;
        amount_out: string;
        min_amount_out: string;
      }[];
      amount_in: string;
      min_amount_out: string;
      amount_out: string;
    }[];
    contract_in: string;
    contract_out: string;
    amount_in: string;
    amount_out: string;
  }