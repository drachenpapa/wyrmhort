import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';

import type {AuthMode} from '../hooks/useAuth';
import {logger} from '../logger';
import {Expense} from '../types/Expense';
import {createEmptyExpense} from '../utils/expenses';

type Props = {
    open: boolean;
    onClose: () => void;
    onSave: (expense: Expense) => Promise<void>;
    initialData?: Expense;
    authMode: AuthMode;
};

function toFormData(data: Expense): Expense {
    return {
        ...data,
        date: data.date ? new Date(data.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    };
}

export default function ExpenseDialog({open, onClose, onSave, initialData = createEmptyExpense(), authMode}: Props) {
    const {t} = useTranslation();
    const [form, setForm] = useState<Expense>(() => toFormData(initialData));
    const [saving, setSaving] = useState(false);
    const [prevOpen, setPrevOpen] = useState(open);
    const [prevInitialData, setPrevInitialData] = useState(initialData);

    if (open !== prevOpen || initialData !== prevInitialData) {
        setPrevOpen(open);
        setPrevInitialData(initialData);
        if (open) {
            setForm(toFormData(initialData ?? createEmptyExpense()));
        }
    }

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
