// Parses and validates input arguments for get-transactions tool

import { GetTransactionsArgs } from '../../types.js';

export class GetTransactionsInputParser {
  parse(args: unknown): GetTransactionsArgs {
    if (!args || typeof args !== 'object') {
      throw new Error(
        'Arguments must be an object. Provide at least accountId. If you do not know it yet, call get-accounts first.'
      );
    }
    const argsObj = args as Record<string, unknown>;
    const { accountId, startDate, endDate, minAmount, maxAmount, categoryName, payeeName, limit } = argsObj;
    if (!accountId || typeof accountId !== 'string') {
      throw new Error(
        'accountId is required and must be a string. Call get-accounts first, then pass one of the returned account IDs to get-transactions.'
      );
    }
    return {
      accountId,
      startDate: typeof startDate === 'string' ? startDate : undefined,
      endDate: typeof endDate === 'string' ? endDate : undefined,
      minAmount: typeof minAmount === 'number' ? minAmount : undefined,
      maxAmount: typeof maxAmount === 'number' ? maxAmount : undefined,
      categoryName: typeof categoryName === 'string' ? categoryName : undefined,
      payeeName: typeof payeeName === 'string' ? payeeName : undefined,
      limit: typeof limit === 'number' ? limit : undefined,
    };
  }
}
