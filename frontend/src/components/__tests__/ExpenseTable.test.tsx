import {fireEvent, render, screen} from '@testing-library/react';
import {vi} from 'vitest';

import type {AuthMode} from '../../hooks/useAuth';
import type {Expense} from '../../types/Expense';
import ExpenseTable from '../ExpenseTable';

const EXPENSES: Expense[] = [
    {id: '1', date: '2024-01-15T00:00:00Z', amount: 10, product: 'Lego', item_type: 'Set', series: 'City', quantity: 1, seller: 'Amazon', marketplace: null},
    {id: '2', date: '2024-02-20T00:00:00Z', amount: 20, product: 'Playmobil', item_type: 'Figure', series: 'Western', quantity: 2, seller: 'eBay', marketplace: 'Online'},
];

const baseProps = {
    expenses: EXPENSES,
    onEdit: vi.fn(),
    onDelete: vi.fn().mockResolvedValue(undefined),
    loading: false,
    error: null,
    sortKey: 'date',
    sortAsc: false,
    onSortChange: vi.fn(),
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    onNextPage: vi.fn(),
    onPrevPage: vi.fn(),
    onPageSizeChange: vi.fn(),
    onPageChange: vi.fn(),
    authMode: 'firebase' as AuthMode,
};

describe('<ExpenseTable/>', () => {
    beforeEach(() => vi.clearAllMocks());

    it('renders expense rows', () => {
        render(<ExpenseTable {...baseProps}/>);
        expect(screen.getByText('Lego')).toBeInTheDocument();
        expect(screen.getByText('Playmobil')).toBeInTheDocument();
        expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('shows loading spinner when loading', () => {
        render(<ExpenseTable {...baseProps} loading={true} expenses={[]}/>);
        expect(screen.getByText('loading')).toBeInTheDocument();
    });

    it('shows error message when error is set', () => {
        render(<ExpenseTable {...baseProps} error="Something went wrong" expenses={[]}/>);
        expect(screen.getByText('error_loading_data')).toBeInTheDocument();
    });

    it('shows empty state when there are no expenses', () => {
        render(<ExpenseTable {...baseProps} expenses={[]}/>);
        expect(screen.getByText('no_data')).toBeInTheDocument();
    });

    it('calls onSortChange when a column header is clicked', () => {
        render(<ExpenseTable {...baseProps}/>);
        fireEvent.click(screen.getByText(/amount/));
        expect(baseProps.onSortChange).toHaveBeenCalledWith('amount');
    });

    it('calls onEdit when edit button is clicked', () => {
        render(<ExpenseTable {...baseProps}/>);
        fireEvent.click(screen.getAllByTitle('edit')[0]);
        expect(baseProps.onEdit).toHaveBeenCalledWith(EXPENSES[0]);
    });

    it('delete button is disabled in demo mode', () => {
        render(<ExpenseTable {...baseProps} authMode="demo"/>);
        const deleteButtons = screen.getAllByTitle('delete');
        deleteButtons.forEach((button) => expect(button).toBeDisabled());
    });

    it('delete button is enabled in firebase mode', () => {
        render(<ExpenseTable {...baseProps}/>);
        const deleteButtons = screen.getAllByTitle('delete');
        deleteButtons.forEach((button) => expect(button).toBeEnabled());
    });
});
