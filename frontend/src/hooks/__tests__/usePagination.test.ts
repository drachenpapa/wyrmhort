import {act, renderHook} from '@testing-library/react';

import {usePagination} from '../usePagination';

describe('usePagination', () => {
    it('initialises with default values', () => {
        const {result} = renderHook(() => usePagination());
        expect(result.current.currentPage).toBe(1);
        expect(result.current.pageSize).toBe(20);
    });

    it('accepts a custom default page size', () => {
        const {result} = renderHook(() => usePagination(50));
        expect(result.current.pageSize).toBe(50);
    });

    it('handlePageChange updates currentPage', () => {
        const {result} = renderHook(() => usePagination());
        act(() => result.current.handlePageChange(3));
        expect(result.current.currentPage).toBe(3);
    });

    it('handlePageSizeChange resets to page 1', () => {
        const {result} = renderHook(() => usePagination());
        act(() => result.current.handlePageChange(5));
        act(() => result.current.handlePageSizeChange(50));
        expect(result.current.pageSize).toBe(50);
        expect(result.current.currentPage).toBe(1);
    });

    it('goToNextPage increments page up to totalPages', () => {
        const {result} = renderHook(() => usePagination());
        act(() => result.current.goToNextPage(3));
        expect(result.current.currentPage).toBe(2);
        act(() => result.current.goToNextPage(2));
        expect(result.current.currentPage).toBe(2);
    });

    it('goToPrevPage decrements page down to 1', () => {
        const {result} = renderHook(() => usePagination());
        act(() => result.current.handlePageChange(3));
        act(() => result.current.goToPrevPage());
        expect(result.current.currentPage).toBe(2);
        act(() => result.current.goToPrevPage());
        act(() => result.current.goToPrevPage());
        expect(result.current.currentPage).toBe(1);
    });

    it('resetPage resets to page 1', () => {
        const {result} = renderHook(() => usePagination());
        act(() => result.current.handlePageChange(5));
        act(() => result.current.resetPage());
        expect(result.current.currentPage).toBe(1);
    });
});
