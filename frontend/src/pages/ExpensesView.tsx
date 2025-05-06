import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

import ExpenseDialog from '../components/ExpenseDialog';
import ExpenseTable from '../components/ExpenseTable';
import useApiExpenses from '../hooks/useApiExpenses';
import {useAuth} from '../hooks/useAuth';
import {logger} from '../logger';
import {Expense} from '../types/Expense';


export default function ExpensesView() {
    const {user} = useAuth();
    const {t} = useTranslation();
    const {expenses, fetchExpenses, addExpense, updateExpense, deleteExpense, loading, error} = useApiExpenses(user);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [sortKey, setSortKey] = useState<string>("date");
    const [sortAsc, setSortAsc] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const totalPages = Math.ceil(expenses.length / pageSize);
    const paginatedExpenses = expenses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    useEffect(() => {
        if (user) {
            fetchExpenses({sortKey, sortAsc}).catch((err) => {
                logger.error('Error fetching expenses:', err);
            });
        }
    }, [user, fetchExpenses, sortKey, sortAsc]);

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleSortChange = (key: string) => {
        if (key === sortKey) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(true);
        }
        setCurrentPage(1);
    };

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
                expenses={paginatedExpenses}
                onEdit={handleEditExpense}
                onDelete={deleteExpense}
                loading={loading}
                error={error}
                sortKey={sortKey}
                sortAsc={sortAsc}
                onSortChange={handleSortChange}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                onNextPage={handleNextPage}
                onPrevPage={handlePrevPage}
                onPageSizeChange={handlePageSizeChange}
                onPageChange={handlePageChange}
            />
        </div>
    );
}
