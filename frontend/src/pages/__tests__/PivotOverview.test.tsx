import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {vi} from 'vitest';

import PivotOverview from '../PivotOverview';

const EXPENSES = [
    {id: '1', date: '2024-01-15T00:00:00Z', amount: 10, product: 'Lego', item_type: 'Set', series: 'City', quantity: 1, seller: 'Amazon', marketplace: null},
    {id: '2', date: '2024-02-20T00:00:00Z', amount: 20, product: 'Lego', item_type: 'Display', series: 'City', quantity: 1, seller: 'Amazon', marketplace: null},
];

const mockApiState = {
    expenses: EXPENSES,
    fetchExpenses: vi.fn().mockResolvedValue(undefined),
    loading: false,
    error: null as string | null,
};

vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => ({user: {uid: '123', email: 'test@example.com'}, authMode: 'firebase'}),
}));

vi.mock('../../hooks/useApiExpenses', () => ({
    default: () => mockApiState,
}));

describe('<PivotOverview/>', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockApiState.expenses = EXPENSES;
        mockApiState.loading = false;
        mockApiState.error = null;
    });

    it('renders grouped expense data', () => {
        render(<PivotOverview/>);
        expect(screen.getByText('Lego')).toBeInTheDocument();
    });

    it('renders grand total', () => {
        render(<PivotOverview/>);
        expect(screen.getByText(/grand_total/)).toBeInTheDocument();
    });

    it('shows loading spinner when loading', () => {
        mockApiState.loading = true;
        mockApiState.expenses = [];
        render(<PivotOverview/>);
        expect(screen.getByText('loading')).toBeInTheDocument();
    });

    it('shows error message when error is set', () => {
        mockApiState.error = 'Something went wrong';
        mockApiState.expenses = [];
        render(<PivotOverview/>);
        expect(screen.getByText('error_loading_data')).toBeInTheDocument();
    });

    it('calls fetchExpenses on mount', async () => {
        render(<PivotOverview/>);
        await waitFor(() => expect(mockApiState.fetchExpenses).toHaveBeenCalledTimes(1));
    });

    it('toggling a product group shows and hides its children', () => {
        render(<PivotOverview/>);
        const productHeader = screen.getByText('Lego').closest('.pivot-group-header');

        expect(productHeader).not.toBeNull();
        expect(productHeader?.parentElement?.querySelector('.pivot-subgroup')).not.toHaveClass('open');

        fireEvent.click(productHeader!);
        expect(productHeader?.parentElement?.querySelector('.pivot-subgroup')).toHaveClass('open');
    });

    it('apply button triggers fetchExpenses with current filter values', async () => {
        render(<PivotOverview/>);
        const initialCalls = mockApiState.fetchExpenses.mock.calls.length;

        fireEvent.change(screen.getByLabelText('start_date'), {target: {value: '2024-01-01'}});
        fireEvent.change(screen.getByLabelText('end_date'), {target: {value: '2024-02-29'}});
        fireEvent.click(screen.getByText('apply_filters'));

        await waitFor(() => expect(mockApiState.fetchExpenses.mock.calls.length).toBeGreaterThan(initialCalls));
        expect(mockApiState.fetchExpenses).toHaveBeenLastCalledWith({start_date: '2024-01-01', end_date: '2024-02-29'});
    });
});
