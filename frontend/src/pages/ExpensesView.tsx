import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

import ExpenseDialog from '../components/ExpenseDialog';
import ExpenseTable from '../components/ExpenseTable';
import useApiExpenses from '../hooks/useApiExpenses';
import {useAuth} from '../hooks/useAuth';
import {Expense} from '../types/Expense';

export default function ExpensesView() {
    const {user} = useAuth();
    const {t} = useTranslation();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const {expenses, fetchExpenses, addExpense, updateExpense, deleteExpense, loading, error} = useApiExpenses(user);

    useEffect(() => {
        if (user) {
            fetchExpenses().catch((err) => {
                console.error('Error fetching expenses:', err);
            });
        }
    }, [user, fetchExpenses]);

    const handleSaveExpense = async (expense: Expense) => {
        if (expense.id) {
            await updateExpense(expense.id, expense);
        } else {
            await addExpense(expense);
        }
        setDialogOpen(false);
        setEditingExpense(null);
    };

    const handleOpenDialog = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingExpense(null);
    };

    const handleEditExpense = (expense: Expense) => {
        setEditingExpense(expense);
        setDialogOpen(true);
    };

    if (!user) return <p>{t('login')}</p>;

    return (
        <div className="container">
            <button type="button" onClick={handleOpenDialog} aria-label={t('add_expense')}>
                {t('add_expense')}
            </button>

            <ExpenseDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onSave={handleSaveExpense}
                initialData={editingExpense || undefined}
            />

            <ExpenseTable
                expenses={expenses}
                onEdit={handleEditExpense}
                onDelete={deleteExpense}
                loading={loading}
                error={error}
            />
        </div>
    );
}
