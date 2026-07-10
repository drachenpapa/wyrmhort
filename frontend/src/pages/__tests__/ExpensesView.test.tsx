import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {vi} from 'vitest';

import ExpensesView from '../ExpensesView';

const EXPENSES = [
    {id: '1', date: '2024-01-15T00:00:00Z', amount: 10, product: 'Lego', item_type: 'Set', series: 'City', quantity: 1, seller: 'Amazon'},
    {id: '2', date: '2024-02-20T00:00:00Z', amount: 20, product: 'Playmobil', item_type: 'Figure', series: 'Western', quantity: 2, seller: 'eBay'},
];

const mockFetchExpenses = vi.fn().mockResolvedValue(undefined);
const mockAddExpense = vi.fn().mockResolvedValue(undefined);
const mockUpdateExpense = vi.fn().mockResolvedValue(undefined);
const mockDeleteExpense = vi.fn().mockResolvedValue(undefined);

vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => ({
        user: {uid: '123', email: 'test@example.com'},
        authMode: 'firebase',
    }),
}));

vi.mock('../../hooks/useApiExpenses', () => ({
    default: () => ({
        expenses: EXPENSES,
        fetchExpenses: mockFetchExpenses,
        addExpense: mockAddExpense,
        updateExpense: mockUpdateExpense,
        deleteExpense: mockDeleteExpense,
        loading: false,
        error: null,
    }),
}));

describe('<ExpensesView/>', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the add expense button', () => {
        render(<ExpensesView/>);
        expect(screen.getByRole('button', {name: /add_expense/})).toBeInTheDocument();
    });

    it('shows the filter panel when the filters toggle is clicked', () => {
        render(<ExpensesView/>);
        fireEvent.click(screen.getByRole('button', {name: /^filters/}));
        expect(screen.getByTitle('product')).toBeInTheDocument();
    });

    it('resets all filter values when the reset button is clicked', () => {
        render(<ExpensesView/>);
        fireEvent.click(screen.getByRole('button', {name: /^filters/}));

        const productSelect = screen.getByTitle('product');
        fireEvent.change(productSelect, {target: {value: 'Lego'}});
        expect(productSelect).toHaveValue('Lego');

        fireEvent.click(screen.getByRole('button', {name: /reset_filters/}));
        expect(productSelect).toHaveValue('');
    });

    it('opens the dialog when the add expense button is clicked', () => {
        render(<ExpensesView/>);
        fireEvent.click(screen.getByRole('button', {name: /add_expense/}));
        expect(screen.getByRole('button', {name: 'save'})).toBeInTheDocument();
    });

    it('closes the dialog when the cancel button is clicked', async () => {
        render(<ExpensesView/>);
        fireEvent.click(screen.getByRole('button', {name: /add_expense/}));
        expect(screen.getByRole('button', {name: 'save'})).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', {name: 'cancel'}));
        await waitFor(() => {
            expect(screen.queryByRole('button', {name: 'save'})).not.toBeInTheDocument();
        });
    });

    it('calls fetchExpenses on initial render', () => {
        render(<ExpensesView/>);
        expect(mockFetchExpenses).toHaveBeenCalledTimes(1);
    });
});
