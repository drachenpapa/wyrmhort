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

const DEMO_MODE_INFO = 'Hi, you might have not noticed it, but you are in demo mode and just removed a disabled attribute. No API call was made, sorry but thanks for trying!';

export default function useApiExpenses(user: User | null, authMode: AuthMode) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDemoExpenses = useCallback(() => {
        setLoading(true);
        fetch('/demo-data.json')
            .then(res => res.json())
            .then((data) => setExpenses(data))
            .catch(() => setExpenses([]))
            .finally(() => setLoading(false));
        setError(null);
    }, []);

    useEffect(() => {
        if (authMode === 'demo') {
            fetchDemoExpenses();
            return;
        }
        if (!user) return;
        user.getIdToken().then(setToken);
        setError(null);
    }, [user, authMode, fetchDemoExpenses]);

    const getFreshToken = useCallback(async () => {
        if (!user) return null;
        try {
            return await user.getIdToken();
        } catch (e) {
            logger.error('Failed to retrieve token', e);
            setError('Failed to retrieve token');
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
            fetchDemoExpenses();
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
    }, [request, authMode, fetchDemoExpenses]);

    const addExpense = async (expense: Omit<Expense, 'id'>) => {
        if (authMode === 'demo') {
            console.log(DEMO_MODE_INFO);
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
            setExpenses((prev) => [{...expense, id: newExpense.id}, ...prev]);
        }
    };

    const updateExpense = async (id: string, updated: Partial<Expense>) => {
        if (authMode === 'demo') {
            console.log(DEMO_MODE_INFO);
            return;
        }

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
        if (authMode === 'demo') {
            console.log(DEMO_MODE_INFO);
            return;
        }

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
