import {useEffect, useState} from 'react';
import {Expense} from '../types/Expense';
import {User} from 'firebase/auth';

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

    useEffect(() => {
        if (!token) return;

        const fetchExpenses = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/expenses/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch expenses');
                }
                const data = await res.json();
                setExpenses(data.expenses);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Unknown error occurred');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchExpenses();
    }, [token]);

    const addExpense = async (expense: Omit<Expense, 'id'>) => {
        if (!token) return;

        setLoading(true);
        setError(null);
        try {
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

            const newExpense = await res.json();
            setExpenses((prev) => [...prev, {...expense, id: newExpense.id}]);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateExpense = async (id: string, updated: Partial<Expense>) => {
        if (!token) return;

        setLoading(true);
        setError(null);
        try {
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

            setExpenses((prev) =>
                prev.map((e) => (e.id === id ? {...e, ...updated} : e))
            );
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const deleteExpense = async (id: string) => {
        if (!token) return;

        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/expenses/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error('Failed to delete expense');
            }

            setExpenses((prev) => prev.filter((e) => e.id !== id));
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return {expenses, addExpense, updateExpense, deleteExpense, loading, error};
}