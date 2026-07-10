import {act, renderHook} from '@testing-library/react';

import {Expense} from '../../types/Expense';
import {useExpenseFilters} from '../useExpenseFilters';

const EXPENSES: Expense[] = [
    {id: '1', date: '2024-01-15', amount: 10, product: 'Lego', item_type: 'Set', series: 'City', quantity: 1, seller: 'Amazon', marketplace: 'online'},
    {id: '2', date: '2024-02-20', amount: 20, product: 'Playmobil', item_type: 'Figure', series: 'Western', quantity: 2, seller: 'eBay', marketplace: null},
    {id: '3', date: '2024-03-10', amount: 30, product: 'Lego', item_type: 'Set', series: 'Technic', quantity: 1, seller: 'Amazon', marketplace: null},
];

describe('useExpenseFilters', () => {
    it('returns all expenses when no filters are active', () => {
        const {result} = renderHook(() => useExpenseFilters(EXPENSES));
        expect(result.current.filtered).toHaveLength(3);
    });

    it('filters by product (case-insensitive)', () => {
        const {result} = renderHook(() => useExpenseFilters(EXPENSES));
        act(() => result.current.setFilter('product', 'lego'));
        expect(result.current.filtered).toHaveLength(2);
        expect(result.current.filtered.every(e => e.product === 'Lego')).toBe(true);
    });

    it('filters by dateFrom (inclusive)', () => {
        const {result} = renderHook(() => useExpenseFilters(EXPENSES));
        act(() => result.current.setFilter('dateFrom', '2024-02-01'));
        expect(result.current.filtered).toHaveLength(2);
        expect(result.current.filtered.map(e => e.id)).toEqual(['2', '3']);
    });

    it('filters by dateTo (inclusive)', () => {
        const {result} = renderHook(() => useExpenseFilters(EXPENSES));
        act(() => result.current.setFilter('dateTo', '2024-02-28'));
        expect(result.current.filtered).toHaveLength(2);
        expect(result.current.filtered.map(e => e.id)).toEqual(['1', '2']);
    });

    it('combines multiple filters', () => {
        const {result} = renderHook(() => useExpenseFilters(EXPENSES));
        act(() => {
            result.current.setFilter('product', 'Lego');
            result.current.setFilter('series', 'Technic');
        });
        expect(result.current.filtered).toHaveLength(1);
        expect(result.current.filtered[0].id).toBe('3');
    });

    it('resetFilters returns all expenses', () => {
        const {result} = renderHook(() => useExpenseFilters(EXPENSES));
        act(() => result.current.setFilter('product', 'Lego'));
        expect(result.current.filtered).toHaveLength(2);

        act(() => result.current.resetFilters());
        expect(result.current.filtered).toHaveLength(3);
    });

    it('uniqueProducts returns sorted distinct values', () => {
        const {result} = renderHook(() => useExpenseFilters(EXPENSES));
        expect(result.current.uniqueProducts).toEqual(['Lego', 'Playmobil']);
    });

    it('uniqueProducts ignores the current product filter so all options stay visible', () => {
        const {result} = renderHook(() => useExpenseFilters(EXPENSES));
        act(() => result.current.setFilter('product', 'Lego'));
        expect(result.current.uniqueProducts).toEqual(['Lego', 'Playmobil']);
    });

    it('uniqueSellers returns sorted distinct values', () => {
        const {result} = renderHook(() => useExpenseFilters(EXPENSES));
        expect(result.current.uniqueSellers).toEqual(['Amazon', 'eBay']);
    });
});
