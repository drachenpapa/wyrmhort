import {useCallback, useMemo, useState} from 'react';

import {Expense} from '../types/Expense';

export type ExpenseFilterState = {
    dateFrom: string;
    dateTo: string;
    product: string;
    itemType: string;
    series: string;
    marketplace: string;
    seller: string;
};

const EMPTY_FILTERS: ExpenseFilterState = {
    dateFrom: '',
    dateTo: '',
    product: '',
    itemType: '',
    series: '',
    marketplace: '',
    seller: '',
};

// Client-side filtering is intentional for this view: instant UX without a network round-trip.
// The full expense list is already loaded (sorted server-side). Data volume is bounded by the
// single-user design, so filtering in memory is both fast and sufficient.
// PivotOverview and PieChart use server-side date-range filtering instead, because those views
// benefit from reducing the payload before aggregation.
export function useExpenseFilters(expenses: Expense[]) {
    const [filters, setFilters] = useState<ExpenseFilterState>(EMPTY_FILTERS);

    const matchesFilters = useCallback((exp: Expense, ignore: (keyof Expense)[] = []) => {
        const date = exp.date.slice(0, 10);
        const checks = [
            (!filters.dateFrom || ignore.includes('date') || date >= filters.dateFrom),
            (!filters.dateTo || ignore.includes('date') || date <= filters.dateTo),
            (!filters.product || ignore.includes('product') || exp.product?.toLowerCase() === filters.product.toLowerCase()),
            (!filters.itemType || ignore.includes('item_type') || exp.item_type?.toLowerCase() === filters.itemType.toLowerCase()),
            (!filters.series || ignore.includes('series') || exp.series?.toLowerCase() === filters.series.toLowerCase()),
            (!filters.marketplace || ignore.includes('marketplace') || (exp.marketplace || '').toLowerCase() === filters.marketplace.toLowerCase()),
            (!filters.seller || ignore.includes('seller') || exp.seller?.toLowerCase() === filters.seller.toLowerCase()),
        ];
        return checks.every(Boolean);
    }, [filters]);

    const getFiltered = useCallback((ignore: keyof Expense | null = null) => {
        return expenses.filter(exp => matchesFilters(exp, ignore ? [ignore] : []));
    }, [expenses, matchesFilters]);

    const filtered = useMemo(() => getFiltered(), [getFiltered]);

    const uniqueProducts = useMemo(() =>
        Array.from(new Set(getFiltered('product').map(e => e.product).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
        [getFiltered]
    );
    const uniqueItemTypes = useMemo(() =>
        Array.from(new Set(getFiltered('item_type').map(e => e.item_type).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
        [getFiltered]
    );
    const uniqueSeries = useMemo(() =>
        Array.from(new Set(getFiltered('series').map(e => e.series).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
        [getFiltered]
    );
    const uniqueMarketplaces = useMemo(() =>
        Array.from(new Set(getFiltered('marketplace').map(e => e.marketplace).filter((v): v is string => !!v))).sort((a, b) => a.localeCompare(b)),
        [getFiltered]
    );
    const uniqueSellers = useMemo(() =>
        Array.from(new Set(getFiltered('seller').map(e => e.seller).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
        [getFiltered]
    );

    const setFilter = <K extends keyof ExpenseFilterState>(key: K, value: ExpenseFilterState[K]) => {
        setFilters(prev => ({...prev, [key]: value}));
    };

    const resetFilters = () => setFilters(EMPTY_FILTERS);

    return {
        filters,
        setFilter,
        resetFilters,
        filtered,
        uniqueProducts,
        uniqueItemTypes,
        uniqueSeries,
        uniqueMarketplaces,
        uniqueSellers,
    };
}
