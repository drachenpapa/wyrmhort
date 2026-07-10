import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {vi} from 'vitest';

import type {AuthMode} from '../../hooks/useAuth';
import {Expense} from '../../types/Expense';
import ExpenseDialog from '../ExpenseDialog';

const VALID_EXPENSE: Expense = {
    id: '1',
    date: '2024-01-15',
    amount: 42,
    product: 'Lego',
    item_type: 'Set',
    series: 'City',
    quantity: 2,
    seller: 'Amazon',
};

const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onSave: vi.fn().mockResolvedValue(undefined),
    authMode: 'firebase' as AuthMode,
};

describe('<ExpenseDialog/>', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        defaultProps.onSave = vi.fn().mockResolvedValue(undefined);
    });

    it('renders nothing when closed', () => {
        const {container} = render(<ExpenseDialog {...defaultProps} open={false}/>);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the form heading when open', () => {
        render(<ExpenseDialog {...defaultProps}/>);
        expect(screen.getByText('add_expense')).toBeInTheDocument();
    });

    it('save button is disabled when required fields are empty (default state)', () => {
        render(<ExpenseDialog {...defaultProps}/>);
        expect(screen.getByRole('button', {name: 'save'})).toBeDisabled();
    });

    it('save button is disabled in demo mode even with valid data', () => {
        render(<ExpenseDialog {...defaultProps} authMode="demo" initialData={VALID_EXPENSE}/>);
        expect(screen.getByRole('button', {name: 'save'})).toBeDisabled();
    });

    it('save button is enabled when all required fields are filled and mode is firebase', () => {
        render(<ExpenseDialog {...defaultProps} initialData={VALID_EXPENSE}/>);
        expect(screen.getByRole('button', {name: 'save'})).toBeEnabled();
    });

    it('calls onClose when cancel button is clicked', () => {
        render(<ExpenseDialog {...defaultProps}/>);
        fireEvent.click(screen.getByRole('button', {name: 'cancel'}));
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onSave with correct data when save is clicked', async () => {
        render(<ExpenseDialog {...defaultProps} initialData={VALID_EXPENSE}/>);
        fireEvent.click(screen.getByRole('button', {name: 'save'}));

        await waitFor(() => {
            expect(defaultProps.onSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    product: 'Lego',
                    seller: 'Amazon',
                    amount: 42,
                    quantity: 2,
                })
            );
        });
    });

    it('calls onClose after a successful save', async () => {
        render(<ExpenseDialog {...defaultProps} initialData={VALID_EXPENSE}/>);
        fireEvent.click(screen.getByRole('button', {name: 'save'}));

        await waitFor(() => {
            expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
        });
    });

    it('updating a field changes the form state', () => {
        render(<ExpenseDialog {...defaultProps} initialData={VALID_EXPENSE}/>);
        const productInput = screen.getByRole('textbox', {name: /product/i});
        fireEvent.change(productInput, {target: {value: 'Playmobil'}});
        expect(productInput).toHaveValue('Playmobil');
    });
});
