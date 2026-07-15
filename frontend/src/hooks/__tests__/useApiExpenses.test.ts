import {act, renderHook} from '@testing-library/react';
import {User} from 'firebase/auth';
import {vi} from 'vitest';

import useApiExpenses from '../useApiExpenses';

const mockUser = {
    uid: '123',
    email: 'test@example.com',
    getIdToken: vi.fn().mockResolvedValue('mock-token'),
} as unknown as User;

const EXPENSE_INPUT = {
    date: '2024-01-15T00:00:00Z',
    amount: 42,
    product: 'Lego',
    item_type: 'Set',
    series: 'City',
    quantity: 1,
    seller: 'Amazon',
    marketplace: null,
};

const EXPENSE = {id: '1', ...EXPENSE_INPUT};

function mockFetchOnce(response: object) {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(response);
}

describe('useApiExpenses', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('demo mode', () => {
        it('loads demo expenses from /demo-data.json when fetchExpenses is called', async () => {
            mockFetchOnce({json: () => Promise.resolve([EXPENSE])});

            const {result} = renderHook(() => useApiExpenses(null, 'demo'));

                await act(async () => {
                    await result.current.fetchExpenses();
            });

                expect(result.current.expenses).toEqual([EXPENSE]);
            });

        it('does not call non-demo API endpoints for write operations', async () => {
            const {result} = renderHook(() => useApiExpenses(null, 'demo'));
            expect(result.current.expenses).toEqual([]);

            await act(async () => {
                await result.current.addExpense(EXPENSE_INPUT);
            });

            const calls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls as [string][];
            expect(calls.every(([url]) => url === '/demo-data.json')).toBe(true);
        });
    });

    describe('authenticated mode', () => {
        it('fetchExpenses sets expenses from an envelope response', async () => {
            mockFetchOnce({ok: true, json: () => Promise.resolve({expenses: [EXPENSE]})});

            const {result} = renderHook(() => useApiExpenses(mockUser, 'firebase'));
            await act(async () => {
                await result.current.fetchExpenses();
            });

            expect(result.current.expenses).toEqual([EXPENSE]);
            expect(result.current.error).toBeNull();
        });

        it('fetchExpenses sets expenses to empty array when expenses key is missing', async () => {
            mockFetchOnce({ok: true, json: () => Promise.resolve({})});

            const {result} = renderHook(() => useApiExpenses(mockUser, 'firebase'));
            await act(async () => {
                await result.current.fetchExpenses();
            });

            expect(result.current.expenses).toEqual([]);
        });

        it('sets error state when fetch returns a non-ok response', async () => {
            mockFetchOnce({ok: false, status: 500});

            const {result} = renderHook(() => useApiExpenses(mockUser, 'firebase'));
            await act(async () => {
                await result.current.fetchExpenses();
            });

            expect(result.current.error).toBe('Failed to fetch expenses');
        });

        it('addExpense prepends the new expense to the list', async () => {
            mockFetchOnce({ok: true, json: () => Promise.resolve({expenses: [EXPENSE]})});
            const newExpense = {...EXPENSE_INPUT, id: 'new-id', product: 'New Product'};
            mockFetchOnce({ok: true, json: () => Promise.resolve(newExpense)});

            const {result} = renderHook(() => useApiExpenses(mockUser, 'firebase'));
            await act(async () => {
                await result.current.fetchExpenses();
            });

            await act(async () => {
                await result.current.addExpense({...EXPENSE_INPUT, product: 'New Product'});
            });

            expect(result.current.expenses[0]).toMatchObject({product: 'New Product', id: 'new-id'});
            expect(result.current.expenses).toHaveLength(2);
        });

        it('deleteExpense removes the expense from the list', async () => {
            mockFetchOnce({ok: true, json: () => Promise.resolve({expenses: [EXPENSE]})});
            mockFetchOnce({ok: true});

            const {result} = renderHook(() => useApiExpenses(mockUser, 'firebase'));
            await act(async () => {
                await result.current.fetchExpenses();
            });
            await act(async () => {
                await result.current.deleteExpense('1');
            });

            expect(result.current.expenses).toHaveLength(0);
        });

        it('updateExpense updates the matching expense in the list', async () => {
            mockFetchOnce({ok: true, json: () => Promise.resolve({expenses: [EXPENSE]})});
            mockFetchOnce({ok: true, json: () => Promise.resolve(undefined)});

            const {result} = renderHook(() => useApiExpenses(mockUser, 'firebase'));
            await act(async () => {
                await result.current.fetchExpenses();
            });
            await act(async () => {
                await result.current.updateExpense('1', {amount: 99});
            });

            expect(result.current.expenses[0].amount).toBe(99);
        });
    });
});
