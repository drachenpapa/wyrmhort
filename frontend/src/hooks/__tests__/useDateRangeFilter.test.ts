import {act, renderHook} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {useDateRangeFilter} from '../useDateRangeFilter';

function makeInputEvent(name: string, value: string): React.ChangeEvent<HTMLInputElement> {
    return {target: {name, value}} as React.ChangeEvent<HTMLInputElement>;
}

describe('useDateRangeFilter', () => {
    it('starts with empty pending and applied filters', () => {
        const {result} = renderHook(() => useDateRangeFilter());
        expect(result.current.pendingFilters).toEqual({start_date: '', end_date: ''});
        expect(result.current.appliedFilters).toEqual({start_date: '', end_date: ''});
    });

    it('updates pending filters on handleFilterChange without updating applied filters', () => {
        const {result} = renderHook(() => useDateRangeFilter());

        act(() => {
            result.current.handleFilterChange(makeInputEvent('start_date', '2024-01-01'));
        });

        expect(result.current.pendingFilters.start_date).toBe('2024-01-01');
        expect(result.current.appliedFilters.start_date).toBe('');
    });

    it('copies pending to applied filters on handleApplyFilters', () => {
        const {result} = renderHook(() => useDateRangeFilter());

        act(() => {
            result.current.handleFilterChange(makeInputEvent('start_date', '2024-01-01'));
            result.current.handleFilterChange(makeInputEvent('end_date', '2024-12-31'));
        });
        act(() => {
            result.current.handleApplyFilters();
        });

        expect(result.current.appliedFilters).toEqual({start_date: '2024-01-01', end_date: '2024-12-31'});
    });

    it('calls onApply callback before applying filters', () => {
        const onApply = vi.fn();
        const {result} = renderHook(() => useDateRangeFilter(onApply));

        act(() => {
            result.current.handleApplyFilters();
        });

        expect(onApply).toHaveBeenCalledTimes(1);
    });

    it('works without an onApply callback', () => {
        const {result} = renderHook(() => useDateRangeFilter());

        act(() => {
            result.current.handleFilterChange(makeInputEvent('end_date', '2025-06-30'));
        });
        act(() => {
            result.current.handleApplyFilters();
        });

        expect(result.current.appliedFilters.end_date).toBe('2025-06-30');
    });
});
