import {Pencil, Trash2} from 'lucide-react';
import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {Expense} from '../types/Expense';

import ExpenseDialog from './ExpenseDialog';
import {LoadingSpinner} from './LoadingSpinner';

type Props = {
    expenses: Expense[];
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
    loading: boolean;
    error: string | null;
};

export default function ExpenseTable({expenses, onEdit, onDelete, loading, error}: Props) {
    const {t} = useTranslation();
    const [editExpense, setEditExpense] = useState<Expense | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handleEditClick = useCallback((expense: Expense) => {
        setEditExpense(expense);
    }, []);

    const handleDeleteClick = useCallback(async (id: string) => {
        try {
            setDeleteError(null);
            onDelete(id);
        } catch {
            setDeleteError(t('error_deleting_expense'));
        }
    }, [onDelete, t]);

    const handleDialogSave = async (updated: Expense) => {
        onEdit(updated);
        setEditExpense(null);
    };

    return (
        <div className="container">
            <h3>{t('expenses')}</h3>
            {deleteError && <p className="error-message">{deleteError}</p>}
            <table className="expense-table" aria-busy={loading}>
                <thead>
                <tr>
                    <th>{t('date')}</th>
                    <th>{t('amount')}</th>
                    <th>{t('product')}</th>
                    <th>{t('item_type')}</th>
                    <th>{t('series')}</th>
                    <th>{t('quantity')}</th>
                    <th>{t('seller')}</th>
                    <th>{t('marketplace')}</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {loading ? (
                    <tr>
                        <td colSpan={9}>
                            <LoadingSpinner/>
                        </td>
                    </tr>
                ) : error ? (
                    <tr>
                        <td colSpan={9} className="error-message">
                            <p>{t('error_loading_data')}</p>
                        </td>
                    </tr>
                ) : expenses.length === 0 ? (
                    <tr>
                        <td colSpan={9} className="empty-state">
                            {t('no_data')}
                        </td>
                    </tr>
                ) : (
                    expenses.map((exp) => (
                        <tr key={exp.id}>
                            <td>{new Date(exp.date).toLocaleDateString('de-DE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            })}</td>
                            <td>{exp.amount.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}</td>
                            <td>{exp.product}</td>
                            <td>{exp.item_type}</td>
                            <td>{exp.series}</td>
                            <td>{exp.quantity}</td>
                            <td>{exp.seller}</td>
                            <td>{exp.marketplace}</td>
                            <td>
                                <button className="icon-btn" onClick={() => handleEditClick(exp)} title={t('edit')}
                                        aria-label={t('edit')}>
                                    <Pencil size={16}/>
                                </button>
                                <button className="icon-btn" onClick={() => exp.id && handleDeleteClick(exp.id)}
                                        title={t('delete')} aria-label={t('delete')}>
                                    <Trash2 size={16}/>
                                </button>
                            </td>
                        </tr>
                    )))}
                </tbody>
            </table>

            {editExpense && (
                <ExpenseDialog
                    open
                    onClose={() => setEditExpense(null)}
                    onSave={handleDialogSave}
                    initialData={editExpense}
                />
            )}
        </div>
    );
}
