import {User} from 'firebase/auth';
import {useCallback, useEffect, useState} from 'react';

import {logger} from '../logger';
import {Expense} from '../types/Expense';
import {ExpenseFilters} from '../types/ExpenseFilters';

import {AuthMode} from './useAuth';

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

export default function useApiExpenses(user: User | null, authMode: AuthMode) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authMode === 'demo') {
            setLoading(true);
            fetch('/demo-data.json')
                .then(res => res.json())
                .then((data) => setExpenses(data))
                .catch(() => setExpenses([]))
                .finally(() => setLoading(false));
            setError(null);
            return;
        }
        if (!user) return;
        user.getIdToken().then(setToken);
        setError(null);
    }, [user, authMode]);

    const getFreshToken = useCallback(async () => {
        if (!user) return null;
        try {
            return await user.getIdToken();
        } catch (e) {
            logger.error('Token holen fehlgeschlagen', e);
            setError('Token holen fehlgeschlagen');
            return null;
        }
    }, [user]);

    const request = useCallback(async <T, >(fetchFn: (token: string) => Promise<T>): Promise<T | null> => {
        setLoading(true);
        setError(null);
        try {
            logger.debug('Request started');
            const freshToken = await getFreshToken();
            if (!freshToken) return null;
            return await fetchFn(freshToken);
        } catch (e) {
            logger.error('Request failed', e);
            setError(e instanceof Error ? e.message : 'Unknown error');
            return null;
        } finally {
            setLoading(false);
            logger.debug('Request ended');
        }
    }, [getFreshToken]);

    const fetchExpenses = useCallback(async (filters?: ExpenseFilters) => {
        if (authMode === 'demo') {
            setLoading(true);
            fetch('/demo-data.json')
                .then(res => res.json())
                .then((data) => setExpenses(data))
                .catch(() => setExpenses([]))
                .finally(() => setLoading(false));
            return;
        }
        const query = filters ? buildQueryParams(filters) : '';
        const url = query ? `/api/expenses/?${query}` : '/api/expenses/';

        const data = await request(async (token) => {
            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                logger.error('Failed to fetch expenses', {url, status: res.status});
                throw new Error('Failed to fetch expenses');
            }
            return res.json();
        });

        if (data) {
            if (Array.isArray(data)) {
                setExpenses(data);
            } else if (data.expenses) {
                setExpenses(data.expenses);
            } else {
                setExpenses([]);
            }
        }
    }, [request, authMode]);

    const addExpense = async (expense: Omit<Expense, 'id'>) => {
        if (authMode === 'demo') {
            setExpenses(prev => [
                ...prev,
                {id: (Math.random() * 1e9).toFixed(0), ...expense}
            ]);
            return;
        }
        const newExpense = await request(async (token) => {
            const res = await fetch('/api/expenses/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(expense),
            });
            if (!res.ok) {
                logger.error('Failed to add expense', {expense});
                throw new Error('Failed to add expense');
            }
            return res.json();
        });

        if (newExpense) {
            setExpenses((prev) => [...prev, {...expense, id: newExpense.id}]);
        }
    };

    const updateExpense = async (id: string, updated: Partial<Expense>) => {
        const success = await request(async (token) => {
            const res = await fetch(`/api/expenses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updated),
            });
            if (!res.ok) {
                logger.error('Failed to update expense', {id, updated});
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
        const success = await request(async (token) => {
            const res = await fetch(`/api/expenses/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                logger.error('Failed to delete expense', {id});
                throw new Error('Failed to delete expense');
            }
        });

        if (success !== null) {
            setExpenses((prev) => prev.filter((e) => e.id !== id));
        }
    };

    return {expenses, fetchExpenses, addExpense, updateExpense, deleteExpense, loading, error, token};
}
