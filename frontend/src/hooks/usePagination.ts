import {useCallback, useState} from 'react';

/**
 * Manages pagination state and provides handlers for page navigation and page size changes.
 * Extracted from ExpensesView to reduce component complexity.
 */
export function usePagination(defaultPageSize: number = 20) {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    const handlePageSizeChange = useCallback((size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const goToNextPage = useCallback((totalPages: number) => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    }, []);

    const goToPrevPage = useCallback(() => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    }, []);

    const resetPage = useCallback(() => {
        setCurrentPage(1);
    }, []);

    return {
        currentPage,
        pageSize,
        handlePageSizeChange,
        handlePageChange,
        goToNextPage,
        goToPrevPage,
        resetPage,
    };
}
