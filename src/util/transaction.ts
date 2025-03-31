import { getTransactionResult, parsedArgs } from "./txhashContract";


interface TransactionResult {
  txHash: string;
  result: any;
}

export const handleTransactionHash = async (
  transactionHashes: string | string[] | undefined,
  errorMessage?: string | string[],
): Promise<TransactionResult[]> => {
  if (transactionHashes) {
    try {
      const txhash = Array.isArray(transactionHashes)
        ? transactionHashes
        : transactionHashes.split(",");
      const results = await Promise.all(
        txhash.map(async (txHash: string): Promise<TransactionResult> => {
          const result: any = await getTransactionResult(txHash);
          return { txHash, result };
        }),
      );
      return results;
    } catch (error) {
      console.error("Error processing transactions:", error);
      return [];
    }
  }
  return [];
};
