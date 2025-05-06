import {User} from 'firebase/auth';
import {useCallback, useEffect, useState} from 'react';

import {Expense} from '../types/Expense';
import {ExpenseFilters} from '../types/ExpenseFilters';

function buildQueryParams(filters: ExpenseFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            if (key === 'sortKey' || key === 'sortAsc') return;
            params.append(key, value.toString());
        }
    });

    if (filters.sortKey) {
        const sort = filters.sortAsc ? filters.sortKey : `-${filters.sortKey}`;
        params.append('sort', sort);
    }

    return params.toString();
}

export default function useApiExpenses(user: User | null) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        user.getIdToken().then(setToken);
        setError(null);
    }, [user]);

    const request = async <T>(fetchFn: () => Promise<T>): Promise<T | null> => {
        setLoading(true);
        setError(null);
        try {
            return await fetchFn();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchExpenses = useCallback(async (filters?: ExpenseFilters) => {
        if (!token) return;

        const query = filters ? buildQueryParams(filters) : '';
        const url = query ? `/api/expenses/?${query}` : '/api/expenses/';

        const data = await request(async () => {
            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                throw new Error('Failed to fetch expenses');
            }
            return res.json();
        });

        if (data) {
            setExpenses(data.expenses);
        }
    }, [token]);

    const addExpense = async (expense: Omit<Expense, 'id'>) => {
        if (!token) return;

        const newExpense = await request(async () => {
            const res = await fetch('/api/expenses/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(expense),
            });
            if (!res.ok) {
                throw new Error('Failed to add expense');
            }
            return res.json();
        });

        if (newExpense) {
            setExpenses((prev) => [...prev, {...expense, id: newExpense.id}]);
        }
    };

    const updateExpense = async (id: string, updated: Partial<Expense>) => {
        if (!token) return;

        const success = await request(async () => {
            const res = await fetch(`/api/expenses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updated),
            });
            if (!res.ok) {
                throw new Error('Failed to update expense');
            }
        });

        if (success !== null) {
            setExpenses((prev) =>
                prev.map((e) => (e.id === id ? {...e, ...updated} : e))
            );
        }
    };

    const deleteExpense = async (id: string) => {
        if (!token) return;

        const success = await request(async () => {
            const res = await fetch(`/api/expenses/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                throw new Error('Failed to delete expense');
            }
        });

        if (success !== null) {
            setExpenses((prev) => prev.filter((e) => e.id !== id));
        }
    };

    return {expenses, fetchExpenses, addExpense, updateExpense, deleteExpense, loading, error};
}
