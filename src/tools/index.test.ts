import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setupTools } from './index.js';

vi.mock('../actual-api.js', () => ({
  initActualApi: vi.fn(),
  shutdownActualApi: vi.fn(),
}));

vi.mock('./get-transactions/index.js', () => ({
  schema: {
    name: 'get-transactions',
    description: 'Get transactions for an account with optional filtering',
    inputSchema: { type: 'object', properties: { accountId: { type: 'string' } }, required: ['accountId'] },
  },
  handler: vi.fn().mockResolvedValue({
    content: [{ type: 'text', text: 'ok' }],
  }),
}));

import { initActualApi, shutdownActualApi } from '../actual-api.js';
import * as getTransactionsTool from './get-transactions/index.js';

describe('setupTools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('includes get-transactions in the listed read tools', async () => {
    const server = new Server(
      { name: 'test-server', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );

    setupTools(server, false);

    const response = await server['_requestHandlers'].get(ListToolsRequestSchema.shape.method.value)?.({
      method: 'tools/list',
      params: {},
      jsonrpc: '2.0',
      id: 1,
    });

    expect(response.tools.some((tool: { name: string }) => tool.name === 'get-transactions')).toBe(true);
  });

  it('dispatches get-transactions calls to the registered handler', async () => {
    const server = new Server(
      { name: 'test-server', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );

    setupTools(server, false);

    const callHandler = server['_requestHandlers'].get(CallToolRequestSchema.shape.method.value);
    const response = await callHandler?.({
      method: 'tools/call',
      params: {
        name: 'get-transactions',
        arguments: {
          accountId: 'account-123',
          limit: 1,
        },
      },
      jsonrpc: '2.0',
      id: 2,
    });

    expect(initActualApi).toHaveBeenCalledOnce();
    expect(getTransactionsTool.handler).toHaveBeenCalledWith({
      accountId: 'account-123',
      limit: 1,
    });
    expect(shutdownActualApi).toHaveBeenCalledOnce();
    expect(response).toEqual({
      content: [{ type: 'text', text: 'ok' }],
    });
  });

  it('returns an error for an unknown tool name', async () => {
    const server = new Server(
      { name: 'test-server', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );

    setupTools(server, false);

    const callHandler = server['_requestHandlers'].get(CallToolRequestSchema.shape.method.value);
    const response = await callHandler?.({
      method: 'tools/call',
      params: {
        name: 'missing-tool',
        arguments: {},
      },
      jsonrpc: '2.0',
      id: 3,
    });

    expect(response.isError).toBe(true);
    expect(shutdownActualApi).toHaveBeenCalledOnce();
  });
});
