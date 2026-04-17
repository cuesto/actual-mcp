import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = {
  init: vi.fn(),
  getBudgets: vi.fn(),
  downloadBudget: vi.fn(),
  importTransactions: vi.fn(),
  runBankSync: vi.fn(),
  shutdown: vi.fn(),
};

vi.mock('@actual-app/api', () => ({
  default: mockApi,
}));

describe('actual-api initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    delete process.env.ACTUAL_SERVER_URL;
    delete process.env.ACTUAL_PASSWORD;
    delete process.env.ACTUAL_BUDGET_SYNC_ID;
    delete process.env.ACTUAL_BUDGET_ENCRYPTION_PASSWORD;
    delete process.env.ACTUAL_DATA_DIR;
  });

  it('initializes the Actual API with verbose logging disabled', async () => {
    mockApi.init.mockResolvedValue(undefined);
    mockApi.getBudgets.mockResolvedValue([{ id: 'budget-1', cloudFileId: 'cloud-budget-1' }]);
    mockApi.downloadBudget.mockResolvedValue(undefined);

    const { initActualApi } = await import('./actual-api.js');

    await initActualApi();

    expect(mockApi.init).toHaveBeenCalledWith({
      dataDir: expect.any(String),
      verbose: false,
    });
    expect(mockApi.downloadBudget).toHaveBeenCalledWith('cloud-budget-1', undefined);
  });

  it('includes server credentials and verbose false when ACTUAL_SERVER_URL is configured', async () => {
    process.env.ACTUAL_SERVER_URL = 'http://actual_server:5006';
    process.env.ACTUAL_PASSWORD = 'secret';
    process.env.ACTUAL_BUDGET_SYNC_ID = 'budget-sync-id';
    process.env.ACTUAL_BUDGET_ENCRYPTION_PASSWORD = 'budget-password';

    mockApi.init.mockResolvedValue(undefined);
    mockApi.getBudgets.mockResolvedValue([{ id: 'budget-1' }]);
    mockApi.downloadBudget.mockResolvedValue(undefined);

    const { initActualApi } = await import('./actual-api.js');

    await initActualApi();

    expect(mockApi.init).toHaveBeenCalledWith({
      dataDir: expect.any(String),
      serverURL: 'http://actual_server:5006',
      password: 'secret',
      verbose: false,
    });
    expect(mockApi.downloadBudget).toHaveBeenCalledWith('budget-sync-id', {
      password: 'budget-password',
    });
  });

  it('rethrows initialization errors from the Actual API', async () => {
    mockApi.init.mockRejectedValue(new Error('init failed'));

    const { initActualApi } = await import('./actual-api.js');

    await expect(initActualApi()).rejects.toThrow('init failed');
  });
});
