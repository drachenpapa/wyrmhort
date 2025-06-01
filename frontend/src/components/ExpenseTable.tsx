import {Pencil, Trash2} from 'lucide-react';
import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';

import {logger} from '../logger';
import {Expense} from '../types/Expense';

import {LoadingSpinner} from './LoadingSpinner';
import Pagination from './Pagination';
import SortIndicator from './SortIndicator';

type Props = {
    expenses: Expense[];
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => Promise<void>;
    loading: boolean;
    error: string | null;
    sortKey: string;
    sortAsc: boolean;
    onSortChange: (key: string) => void;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onNextPage: () => void;
    onPrevPage: () => void;
    onPageSizeChange: (size: number) => void;
    onPageChange: (page: number) => void;
};

export default function ExpenseTable({
                                         expenses,
                                         onEdit,
                                         onDelete,
                                         loading,
                                         error,
                                         sortKey,
                                         sortAsc,
                                         onSortChange,
                                         currentPage,
                                         totalPages,
                                         pageSize,
                                         onNextPage,
                                         onPrevPage,
                                         onPageSizeChange,
                                         onPageChange
                                     }: Props) {
    const {t} = useTranslation();
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleEditClick = useCallback((expense: Expense) => {
        onEdit(expense);
    }, [onEdit]);

    const handleDeleteClick = useCallback(async (id: string) => {
        try {
            setDeleteError(null);
            setDeleting(true);
            await onDelete(id);
        } catch (error) {
            logger.error('Error deleting expense:', error);
            setDeleteError(t("error_deleting_expense"));
        } finally {
            setDeleting(false);
        }
    }, [onDelete, t]);

    return (
        <div className="container">
            {deleteError && <p className="error-message">{deleteError}</p>}
            <div className="expenses-data-container" style={{position: 'relative'}}>
                <div style={{
                    pointerEvents: deleting ? 'none' : undefined,
                    opacity: deleting ? 0.5 : 1
                }}>
                    <table className="expense-table">
                        <thead>
                        <tr>
                            <th onClick={() => onSortChange("date")}>
                                {t("date")} <SortIndicator active={sortKey === "date"} asc={sortAsc}/>
                            </th>
                            <th onClick={() => onSortChange("amount")}>
                                {t("amount")} <SortIndicator active={sortKey === "amount"} asc={sortAsc}/>
                            </th>
                            <th onClick={() => onSortChange("product")}>
                                {t("product")} <SortIndicator active={sortKey === "product"} asc={sortAsc}/>
                            </th>
                            <th onClick={() => onSortChange("item_type")}>
                                {t("item_type")} <SortIndicator active={sortKey === "item_type"} asc={sortAsc}/>
                            </th>
                            <th onClick={() => onSortChange("series")}>
                                {t("series")} <SortIndicator active={sortKey === "series"} asc={sortAsc}/>
                            </th>
                            <th onClick={() => onSortChange("quantity")}>
                                {t("quantity")} <SortIndicator active={sortKey === "quantity"} asc={sortAsc}/>
                            </th>
                            <th onClick={() => onSortChange("seller")}>
                                {t("seller")} <SortIndicator active={sortKey === "seller"} asc={sortAsc}/>
                            </th>
                            <th onClick={() => onSortChange("marketplace")}>
                                {t("marketplace")} <SortIndicator active={sortKey === "marketplace"} asc={sortAsc}/>
                            </th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={9}>
                                    <LoadingSpinner/>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={9} className="error-message">
                                    <p>{t("error_loading_data")}</p>
                                </td>
                            </tr>
                        ) : expenses.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="empty-state">
                                    {t("no_data")}
                                </td>
                            </tr>
                        ) : (
                            expenses.map((exp) => (
                                <tr key={exp.id}>
                                    <td>{new Date(exp.date).toLocaleDateString('de-DE', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}</td>
                                    <td>{Number(exp.amount).toLocaleString('de-DE', {
                                        style: 'currency',
                                        currency: 'EUR'
                                    })}</td>
                                    <td>{exp.product}</td>
                                    <td>{exp.item_type}</td>
                                    <td>{exp.series}</td>
                                    <td>{exp.quantity}</td>
                                    <td>{exp.seller}</td>
                                    <td>{exp.marketplace}</td>
                                    <td>
                                        <button className="icon-btn" title={t("edit")}
                                                onClick={() => handleEditClick(exp)}>
                                            <Pencil size={16}/>
                                        </button>
                                        <button className="icon-btn" title={t("delete")}
                                                onClick={() => handleDeleteClick(exp.id)}>
                                            <Trash2 size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div>
                {deleting && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.5)',
                        zIndex: 2
                    }}>
                        <LoadingSpinner/>
                    </div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={onPageChange}
                onNextPage={onNextPage}
                onPrevPage={onPrevPage}
                onPageSizeChange={onPageSizeChange}
            />
        </div>
    );
}
