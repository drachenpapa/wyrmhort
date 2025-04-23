import {useEffect, useState} from 'react';
import {Expense} from '../types/Expense';
import {User} from 'firebase/auth';

export default function useApiExpenses(user: User | null) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        user.getIdToken().then(setToken);
    }, [user]);

    useEffect(() => {
        if (!token) return;

        const fetchExpenses = async () => {
            const res = await fetch('/api/expenses/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setExpenses(data.expenses);
        };

        fetchExpenses();
    }, [token]);

    const addExpense = async (expense: Omit<Expense, 'id'>) => {
        if (!token) return;

        const res = await fetch('/api/expenses/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(expense),
        });

        if (res.ok) {
            const newExpense = await res.json();
            setExpenses((prev) => [...prev, {...expense, id: newExpense.id}]);
        }
    };

    const updateExpense = async (id: string, updated: Partial<Expense>) => {
        if (!token) return;

        await fetch(`/api/expenses/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updated),
        });

        setExpenses((prev) =>
            prev.map((e) => (e.id === id ? {...e, ...updated} : e))
        );
    };

    const deleteExpense = async (id: string) => {
        if (!token) return;

        await fetch(`/api/expenses/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        setExpenses((prev) => prev.filter((e) => e.id !== id));
    };

    return {expenses, addExpense, updateExpense, deleteExpense};
}
