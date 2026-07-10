import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import type {ReactNode} from 'react';
import {vi} from 'vitest';

import PieChart from '../PieChart';

const EXPENSES = [
    {id: '1', date: '2024-01-15T00:00:00Z', amount: 10, product: 'Lego', item_type: 'Set', series: 'City', quantity: 1, seller: 'Amazon', marketplace: null},
    {id: '2', date: '2024-02-20T00:00:00Z', amount: 20, product: 'Playmobil', item_type: 'Figure', series: 'Western', quantity: 2, seller: 'eBay', marketplace: null},
];

const mockApiState = {
    expenses: EXPENSES,
    fetchExpenses: vi.fn().mockResolvedValue(undefined),
    loading: false,
    error: null as string | null,
};

vi.mock('recharts', () => ({
    ResponsiveContainer: ({children}: {children: ReactNode}) => <div>{children}</div>,
    PieChart: ({children}: {children: ReactNode}) => <div data-testid="pie-chart">{children}</div>,
    Pie: () => null,
    Cell: () => null,
    Tooltip: () => null,
}));

vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => ({user: {uid: '123', email: 'test@example.com'}, authMode: 'firebase'}),
}));

vi.mock('../../hooks/useApiExpenses', () => ({
    default: () => mockApiState,
}));

describe('<PieChart/>', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockApiState.expenses = EXPENSES;
        mockApiState.loading = false;
        mockApiState.error = null;
    });

    it('renders the chart and grand total', () => {
        render(<PieChart/>);
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
        expect(screen.getByText(/grand_total/)).toBeInTheDocument();
    });

    it('shows loading spinner when loading', () => {
        mockApiState.loading = true;
        mockApiState.expenses = [];
        render(<PieChart/>);
        expect(screen.getByText('loading')).toBeInTheDocument();
    });

    it('shows error message when error is set', () => {
        mockApiState.error = 'Something went wrong';
        mockApiState.expenses = [];
        render(<PieChart/>);
        expect(screen.getByText('error_loading_data')).toBeInTheDocument();
    });

    it('shows empty state when there are no expenses', () => {
        mockApiState.expenses = [];
        render(<PieChart/>);
        expect(screen.getByText('no_expenses_found')).toBeInTheDocument();
    });

    it('calls fetchExpenses on mount', async () => {
        render(<PieChart/>);
        await waitFor(() => expect(mockApiState.fetchExpenses).toHaveBeenCalledTimes(1));
    });

    it('apply button triggers fetchExpenses with current filter values', async () => {
        render(<PieChart/>);
        const initialCalls = mockApiState.fetchExpenses.mock.calls.length;

        fireEvent.change(screen.getByLabelText('start_date'), {target: {value: '2024-01-01'}});
        fireEvent.change(screen.getByLabelText('end_date'), {target: {value: '2024-02-29'}});
        fireEvent.click(screen.getByText('apply_filters'));

        await waitFor(() => expect(mockApiState.fetchExpenses.mock.calls.length).toBeGreaterThan(initialCalls));
        expect(mockApiState.fetchExpenses).toHaveBeenLastCalledWith({start_date: '2024-01-01', end_date: '2024-02-29'});
    });
});
