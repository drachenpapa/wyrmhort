import {Expense} from '../types/Expense';

export function formatCurrency(amount: number): string {
    return amount.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'});
}

export function normalizeExpense(expense: unknown): Expense {
    if (typeof expense !== 'object' || expense === null) {
        throw new Error('Invalid expense response');
    }

    const record = expense as Record<string, unknown>;
    const amount = record.amount;
    const normalizedAmount = typeof amount === 'number'
        ? amount
        : typeof amount === 'string' && amount.trim() !== ''
            ? Number(amount)
            : Number.NaN;

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
        throw new Error('Invalid expense: amount must be a positive finite number');
    }

    if (
        typeof record.id !== 'string'
        || typeof record.date !== 'string'
        || typeof record.product !== 'string'
        || typeof record.item_type !== 'string'
        || typeof record.series !== 'string'
        || typeof record.quantity !== 'number'
        || !Number.isInteger(record.quantity)
        || record.quantity < 1
        || typeof record.seller !== 'string'
        || (record.marketplace !== null && typeof record.marketplace !== 'string')
    ) {
        throw new Error('Invalid expense response');
    }

    return {
        id: record.id,
        date: record.date,
        amount: normalizedAmount,
        product: record.product,
        item_type: record.item_type,
        series: record.series,
        quantity: record.quantity,
        seller: record.seller,
        marketplace: record.marketplace,
    };
}

export function createEmptyExpense(): Expense {
    return {
        id: '',
        date: new Date().toISOString().slice(0, 10),
        amount: 0,
        product: '',
        item_type: '',
        series: '',
        quantity: 1,
        seller: '',
        marketplace: null,
    };
}
