import {useEffect, useState} from 'react';
import {Expense} from '../types/Expense';
import {useTranslation} from 'react-i18next';

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: (expense: Expense) => Promise<void>;
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
    const [saving, setSaving] = useState(false);

    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        if (open) {
            if (initialData) {
                setForm(initialData);
            } else {
                setForm({
                    date: today,
                    amount: 0,
                    quantity: 1,
                    marketplace: '',
                    seller: '',
                    product: '',
                    item_type: '',
                    series: '',
                });
            }
        }
    }, [initialData, open]);

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
        form.item_type.trim() !== '' &&
        form.series.trim() !== '';

    const cleanOptionalFields = (value?: string): string | undefined =>
        value?.trim() === '' ? undefined : value?.trim();

    const handleSubmit = async () => {
        setSaving(true);
        try {
            await onSave({
                ...form,
                date: new Date(form.date).toISOString(),
                marketplace: cleanOptionalFields(form.marketplace),
            });
            onClose();
        } finally {
            setSaving(false);
        }
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
                        'product',
                        'item_type',
                        'series',
                        'quantity',
                        'seller',
                        'marketplace'
                    ].map((field) => (
                        <div key={field} style={{marginBottom: '1rem'}}>
                            <label htmlFor={field}>{t(field)}{field !== 'marketplace' &&
                                <span className="required">*</span>}</label><br/>
                            <input
                                type={field === 'date' ? 'date' : field === 'amount' || field === 'quantity' ? 'number' : 'text'}
                                id={field}
                                name={field}
                                value={form[field as keyof Expense]}
                                onChange={handleChange}
                                style={{width: '100%'}}
                                min={field === 'amount' || field === 'quantity' ? 0 : undefined}
                            />
                        </div>
                    ))}
                    <p style={{fontSize: '0.85rem', color: '#555', marginTop: '-0.5rem', marginBottom: '1rem'}}>
                        * {t('required_field_hint')}
                    </p>
                    <div className="dialog-actions">
                        <button type="button" className="btn secondary" onClick={onClose} disabled={saving}>
                            {t('cancel')}
                        </button>
                        <button type="button" className="btn primary" onClick={handleSubmit}
                                disabled={!isValid || saving}>
                            {saving ? <span className="btn-spinner"/> : t('save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
