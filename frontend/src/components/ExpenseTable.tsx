import { useState } from 'react';
import { Expense } from '../types/Expense';
import { useTranslation } from 'react-i18next';
import ExpenseDialog from './ExpenseDialog';

type Props = {
    expenses: Expense[];
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
};

export default function ExpenseTable({ expenses, onEdit, onDelete }: Props) {
    const { t } = useTranslation();
    const [editExpense, setEditExpense] = useState<Expense | null>(null);

    const handleEditClick = (expense: Expense) => {
        setEditExpense(expense);
    };

    const handleDialogSave = (updated: Expense) => {
        onEdit(updated);
        setEditExpense(null);
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <h3>{t('expenses')}</h3>
            <table border={1} cellPadding={8}>
                <thead>
                <tr>
                    <th>{t('date')}</th>
                    <th>{t('amount')}</th>
                    <th>{t('quantity')}</th>
                    <th>{t('product')}</th>
                    <th>{t('marketplace')}</th>
                    <th>{t('seller')}</th>
                    <th>{t('item_type')}</th>
                    <th>{t('series')}</th>
                    <th>Aktionen</th>
                </tr>
                </thead>
                <tbody>
                {expenses.map((exp) => (
                    <tr key={exp.id}>
                        <td>{new Date(exp.date).toLocaleDateString()}</td>
                        <td>{exp.amount}</td>
                        <td>{exp.quantity}</td>
                        <td>{exp.product}</td>
                        <td>{exp.marketplace}</td>
                        <td>{exp.seller}</td>
                        <td>{exp.item_type}</td>
                        <td>{exp.series}</td>
                        <td>
                            <button onClick={() => handleEditClick(exp)}>Edit</button>{' '}
                            <button onClick={() => exp.id && onDelete(exp.id)}>Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {editExpense && (
                <ExpenseDialog
                    open={true}
                    onClose={() => setEditExpense(null)}
                    onSave={handleDialogSave}
                    initialData={editExpense}
                />
            )}
        </div>
    );
}
