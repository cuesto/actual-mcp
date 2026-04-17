import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handler, schema } from './index.js';
import { textContent } from '../../utils/response.js';

vi.mock('./data-fetcher.js', () => ({
  GetTransactionsDataFetcher: class {
    async fetch() {
      return [
        {
          id: 'txn-1',
          date: '2026-04-14',
          amount: -1000,
          payee_name: 'Coffee Shop',
          category_name: 'Food',
          notes: 'Latte',
          cleared: true,
        },
      ];
    }
  },
}));

describe('get-transactions tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('includes a descriptive accountId schema for agent guidance', () => {
    const inputSchema = schema.inputSchema as {
      properties?: Record<string, { description?: string }>;
    };

    expect(inputSchema.properties?.accountId?.description).toContain('Call get-accounts first');
  });

  it('returns transactions when accountId is provided', async () => {
    const result = await handler({
      accountId: '8f5c8893-8146-4ec5-8df1-542a3a979737',
      limit: 1,
    });

    expect(result.isError).toBeUndefined();
    expect(textContent(result.content[0])).toContain('Filtered Transactions');
    expect(textContent(result.content[0])).toContain('Coffee Shop');
  });

  it('returns an actionable validation error when accountId is missing', async () => {
    const result = await handler({} as never);

    expect(result.isError).toBe(true);
    expect(textContent(result.content[0])).toContain('Call get-accounts first');
  });
});
