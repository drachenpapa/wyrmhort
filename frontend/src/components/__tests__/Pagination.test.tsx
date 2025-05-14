import {fireEvent, render, screen} from '@testing-library/react';
import {vi} from 'vitest';

import Pagination from '../Pagination';

describe('Pagination', () => {
    const onPageChangeMock = vi.fn();
    const onNextPageMock = vi.fn();
    const onPrevPageMock = vi.fn();
    const onPageSizeChangeMock = vi.fn();

    const defaultProps = {
        currentPage: 1,
        totalPages: 5,
        pageSize: 10,
        onPageChange: onPageChangeMock,
        onNextPage: onNextPageMock,
        onPrevPage: onPrevPageMock,
        onPageSizeChange: onPageSizeChangeMock,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders pagination controls', () => {
        render(<Pagination {...defaultProps} />);

        expect(screen.getByText('previous')).toBeInTheDocument();
        expect(screen.getByText('next')).toBeInTheDocument();
        expect(screen.getByLabelText('items_per_page')).toBeInTheDocument();

        for (let i = 1; i <= defaultProps.totalPages; i++) {
            expect(screen.getByText(i.toString())).toBeInTheDocument();
        }
    });

    test('next button is disabled on last page', () => {
        render(<Pagination {...defaultProps} currentPage={5} totalPages={5}/>);

        expect(screen.getByText('next')).toBeDisabled();
    });

    test('previous button is disabled on first page', () => {
        render(<Pagination {...defaultProps} currentPage={1} totalPages={5}/>);

        expect(screen.getByText('previous')).toBeDisabled();
    });

    test('shows next page when next-button is clicked', () => {
        render(<Pagination {...defaultProps} currentPage={1} totalPages={5}/>);

        fireEvent.click(screen.getByText('next'));

        expect(onNextPageMock).toHaveBeenCalled();
    });

    test('shows previous page when previous-button is clicked', () => {
        render(<Pagination {...defaultProps} currentPage={2} totalPages={5}/>);

        fireEvent.click(screen.getByText('previous'));

        expect(onPrevPageMock).toHaveBeenCalled();
    });

    test('changes page when a page is selected', () => {
        render(<Pagination {...defaultProps} currentPage={2} totalPages={5}/>);
        const pageSelect = screen.getByDisplayValue('2');

        fireEvent.change(pageSelect, {target: {value: '4'}});

        expect(onPageChangeMock).toHaveBeenCalledWith(4);
    });

    test('changes size when page size is changed', () => {
        render(<Pagination {...defaultProps} />);
        const sizeSelect = screen.getByLabelText('items_per_page');

        fireEvent.change(sizeSelect, {target: {value: '50'}});

        expect(onPageSizeChangeMock).toHaveBeenCalledWith(50);
    });
});
