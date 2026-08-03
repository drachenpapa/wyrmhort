import React, {useState} from 'react';

import {ExpenseFilters} from '../types/ExpenseFilters';

export type DateRangeFilters = Pick<ExpenseFilters, 'start_date' | 'end_date'>;

const EMPTY_DATE_RANGE: DateRangeFilters = {start_date: '', end_date: ''};

/**
 * Manages a two-phase date-range filter: pending (while the user types) and
 * applied (after the user confirms). Prevents double-fetching on every keystroke.
 *
 * @param onApply Optional callback invoked synchronously before the filters are applied.
 *                Use this to reset derived state (e.g., a selected chart segment).
 */
export function useDateRangeFilter(onApply?: () => void) {
    const [pendingFilters, setPendingFilters] = useState<DateRangeFilters>(EMPTY_DATE_RANGE);
    const [appliedFilters, setAppliedFilters] = useState<DateRangeFilters>(EMPTY_DATE_RANGE);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setPendingFilters(prev => ({...prev, [name]: value}));
    };

    const handleApplyFilters = () => {
        onApply?.();
        setAppliedFilters(pendingFilters);
    };

    return {pendingFilters, appliedFilters, handleFilterChange, handleApplyFilters};
}
