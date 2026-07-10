import {Expense} from '../types/Expense';

export function formatCurrency(amount: number): string {
    return amount.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'});
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
