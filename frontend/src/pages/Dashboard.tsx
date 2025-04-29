import ExpenseTable from '../components/ExpenseTable';
import ExpenseDialog from '../components/ExpenseDialog';
import {useEffect, useState} from 'react';
import {Expense} from '../types/Expense';
import useApiExpenses from '../hooks/useApiExpenses';
import {useAuth} from '../hooks/useAuth';

export default function Dashboard() {
    const {user} = useAuth();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const {expenses, addExpense, updateExpense, deleteExpense, loading, error} = useApiExpenses(user);

    useEffect(() => {

    }, [user]);

    const handleSaveExpense = (expense: Expense) => {
        if (expense.id) {
            updateExpense(expense.id, expense);
        } else {
            addExpense(expense);
        }
        setDialogOpen(false);
        setEditingExpense(null);
    };

    if (!user) return <p>Bitte einloggen</p>;

    return (
        <div className="container">
            <button onClick={() => setDialogOpen(true)}>+ Add Expense</button>

            <ExpenseDialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setEditingExpense(null);
                }}
                onSave={handleSaveExpense}
                initialData={editingExpense || undefined}
            />

            <ExpenseTable
                expenses={expenses}
                onEdit={(e) => {
                    setEditingExpense(e);
                    setDialogOpen(true);
                }}
                onDelete={deleteExpense}
                loading={loading}
                error={error}
            />
        </div>
    );
}
