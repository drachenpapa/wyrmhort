import {useEffect, useState} from 'react';
import {onAuthStateChanged, signInWithPopup, signOut, User} from 'firebase/auth';
import {auth, provider} from './firebase';
import ExpenseTable from './components/ExpenseTable';
import ExpenseDialog from './components/ExpenseDialog';
import useApiExpenses from './hooks/useApiExpenses.ts';
import {Expense} from './types/Expense';

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [, setEditingExpense] = useState<Expense | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const {expenses, addExpense, updateExpense, deleteExpense} = useApiExpenses(user);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
    }, []);

    const handleLogin = async () => {
        await signInWithPopup(auth, provider);
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    const openCreateDialog = () => {
        setEditingExpense(null);
        setDialogOpen(true);
    };

    const openEditDialog = (expense: Expense) => {
        setEditingExpense(expense);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditingExpense(null);
    };

    const handleSaveExpense = (expense: Expense) => {
        if (expense.id) {
            updateExpense(expense.id, expense);
        } else {
            addExpense(expense);
        }
        closeDialog();
    };

    return (
        <div style={{padding: '2rem'}}>
            {user ? (
                <>
                    <h2>Hi, {user.displayName}</h2>
                    <button onClick={handleLogout}>Logout</button>

                    <ExpenseDialog
                        open={dialogOpen}
                        onClose={closeDialog}
                        onSave={handleSaveExpense}
                    />

                    <ExpenseTable
                        expenses={expenses}
                        onEdit={openEditDialog}
                        onDelete={(id) => deleteExpense(id)}
                    />

                    <button onClick={openCreateDialog}>Add Expense</button>
                </>
            ) : (
                <button onClick={handleLogin}>Login mit Google</button>
            )}
        </div>
    );
}

export default App;
