import { useEffect, useState } from 'react';
import { Expense } from '../types/Expense';
import { useTranslation } from 'react-i18next';

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: (expense: Expense) => void;
    initialData?: Expense;
};

export default function ExpenseDialog({ open, onClose, onSave, initialData }: Props) {
    const { t } = useTranslation();
    const [form, setForm] = useState<Expense>({
        date: '',
        amount: 0,
        quantity: 1,
        marketplace: '',
        seller: '',
        product: '',
        item_type: '',
        series: '',
    });

    useEffect(() => {
        if (initialData) {
            setForm(initialData);
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev: Expense) => ({
            ...prev,
            [name]: name === 'amount' || name === 'quantity' ? Number(value) : value,
        }));
    };

    const handleSubmit = () => {
        onSave(form);
        onClose();
    };

    if (!open) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '500px' }}>
                <h3>{t('add_expense')}</h3>
                <form onSubmit={(e) => e.preventDefault()}>
                    {[
                        'date',
                        'amount',
                        'quantity',
                        'marketplace',
                        'seller',
                        'product',
                        'item_type',
                        'series',
                    ].map((field) => (
                        <div key={field} style={{ marginBottom: '1rem' }}>
                            <label htmlFor={field}>{t(field)}</label><br />
                            <input
                                type={field === 'date' ? 'date' : field === 'amount' || field === 'quantity' ? 'number' : 'text'}
                                id={field}
                                name={field}
                                value={form[field as keyof Expense]}
                                onChange={handleChange}
                                style={{ width: '100%' }}
                            />
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="button" onClick={handleSubmit}>
                            {t('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
