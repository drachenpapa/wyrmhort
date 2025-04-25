import {useEffect, useState} from 'react';
import {Expense} from '../types/Expense';
import {useTranslation} from 'react-i18next';

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: (expense: Expense) => void;
    initialData?: Expense;
};

export default function ExpenseDialog({open, onClose, onSave, initialData}: Props) {
    const {t} = useTranslation();
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
        const {name, value} = e.target;
        setForm((prev: Expense) => ({
            ...prev,
            [name]: name === 'amount' || name === 'quantity' ? Number(value) : value,
        }));
    };

    const isValid =
        !!form.date &&
        form.amount > 0 &&
        form.quantity > 0 &&
        form.seller.trim() !== '' &&
        form.product.trim() !== '' &&
        form.item_type.trim() !== '';

    const cleanOptionalFields = (value?: string): string | undefined =>
        value?.trim() === '' ? undefined : value?.trim();

    const handleSubmit = () => {
        onSave({
            ...form,
            date: new Date(form.date).toISOString(),
            series: cleanOptionalFields(form.series),
            marketplace: cleanOptionalFields(form.marketplace),
        });
        onClose();
    };

    if (!open) return null;

    return (
        <div className="dialog-overlay">
            <div className="dialog">
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
                        <div key={field} style={{marginBottom: '1rem'}}>
                            <label htmlFor={field}>{t(field)}</label><br/>
                            <input
                                type={field === 'date' ? 'date' : field === 'amount' || field === 'quantity' ? 'number' : 'text'}
                                id={field}
                                name={field}
                                value={form[field as keyof Expense]}
                                onChange={handleChange}
                                style={{width: '100%'}}
                            />
                        </div>
                    ))}
                    <div className="dialog-actions">
                        <button type="button" className="btn secondary" onClick={onClose}>
                            {t('cancel')}
                        </button>
                        <button type="button" className="btn primary" onClick={handleSubmit} disabled={!isValid}>
                            {t('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
