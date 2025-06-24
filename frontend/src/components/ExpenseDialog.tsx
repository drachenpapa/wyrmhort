import React, {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

import type {AuthMode} from '../hooks/useAuth';
import {logger} from '../logger';
import {Expense} from '../types/Expense';

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: (expense: Expense) => Promise<void>;
    initialData?: Expense;
    authMode: AuthMode;
};

const emptyExpense: Expense = {
    id: "",
    date: new Date().toISOString().slice(0, 10),
    amount: 0,
    product: '',
    item_type: '',
    series: '',
    quantity: 1,
    seller: '',
    marketplace: undefined
};

export default function ExpenseDialog({open, onClose, onSave, initialData = emptyExpense, authMode}: Props) {
    const {t} = useTranslation();
    const [form, setForm] = useState<Expense>(emptyExpense);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            const data = initialData ?? emptyExpense;
            setForm({
                ...data,
                date: data.date ? new Date(data.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
            });
        }
    }, [open, initialData]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setForm((prev: Expense) => {
            return {
                ...prev,
                [name]: name === 'amount' || name === 'quantity' ? Number(value) : value,
            };
        });
    }, []);

    const cleanOptionalFields = (value?: string): string | undefined =>
        value?.trim() === '' ? undefined : value?.trim();

    const handleSubmit = useCallback(async () => {
        setSaving(true);
        try {
            await onSave({
                ...form,
                date: new Date(form.date).toISOString(),
                marketplace: cleanOptionalFields(form.marketplace),
            });
            onClose();
        } catch (error) {
            logger.error('Error saving expense:', error);
        } finally {
            setSaving(false);
        }
    }, [form, onSave, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div className="dialog-overlay">
            <div className="dialog">
                <h3>{t("add_expense")}</h3>
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
                        <div key={field} className="form-field">
                            <label htmlFor={field}>
                                {field === 'amount'
                                    ? `${t(field)} (€)`
                                    : t(field)}{field !== 'marketplace' && <span className="required">*</span>}
                            </label>
                            <input
                                type={field === 'date' ? 'date' : field === 'amount' || field === 'quantity' ? 'number' : 'text'}
                                id={field}
                                name={field}
                                value={form[field as keyof Expense]}
                                onChange={handleChange}
                                className="input-full-width"
                                min={field === 'amount' || field === 'quantity' ? 0 : undefined}
                            />
                        </div>
                    ))}
                    <p className="form-hint">
                        * {t("required_field_hint")}
                    </p>
                    <div className="dialog-actions">
                        <button type="button" className="btn secondary" onClick={onClose} disabled={saving}>
                            {t("cancel")}
                        </button>
                        <button type="button" className="btn primary" onClick={handleSubmit}
                                disabled={
                                    !form.date ||
                                    form.amount <= 0 ||
                                    form.quantity <= 0 ||
                                    form.seller.trim() === '' ||
                                    form.product.trim() === '' ||
                                    form.item_type.trim() === '' ||
                                    form.series.trim() === '' ||
                                    saving ||
                                    authMode === 'demo'}>
                            {saving ? <span className="btn-spinner"/> : t("save")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
