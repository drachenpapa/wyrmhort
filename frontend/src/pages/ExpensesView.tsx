import {ChevronDown, ChevronUp, Plus, RotateCcw} from 'lucide-react';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

import ExpenseDialog from '../components/ExpenseDialog';
import ExpenseTable from '../components/ExpenseTable';
import useApiExpenses from '../hooks/useApiExpenses';
import {useAuth} from '../hooks/useAuth';
import {useExpenseFilters} from '../hooks/useExpenseFilters';
import {logger} from '../logger';
import {Expense} from '../types/Expense';
import {createEmptyExpense} from '../utils/expenses';

export default function ExpensesView() {
    const {user, authMode} = useAuth();
    const {t} = useTranslation();
    const {
        expenses,
        fetchExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        loading,
        error,
    } = useApiExpenses(user, authMode);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const dialogOpen = editingExpense !== null;
    const [sortKey, setSortKey] = useState<string>("date");
    const [sortAsc, setSortAsc] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [showFilters, setShowFilters] = useState(false);

    const {
        filters,
        setFilter,
        resetFilters,
        filtered: filteredExpenses,
        uniqueProducts,
        uniqueItemTypes,
        uniqueSeries,
        uniqueMarketplaces,
        uniqueSellers,
    } = useExpenseFilters(expenses);

    const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / pageSize));
    const validatedCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
    const paginatedExpenses = filteredExpenses.slice((validatedCurrentPage - 1) * pageSize, validatedCurrentPage * pageSize);

    useEffect(() => {
        if ((user && user.email) || authMode === 'demo') {
            fetchExpenses({sortKey, sortAsc}).catch((err) => {
                logger.error('Error fetching expenses:', err);
            });
        }
    }, [user, fetchExpenses, sortKey, sortAsc, authMode]);

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleSortChange = (key: string) => {
        if (key === sortKey) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(true);
        }
        setCurrentPage(1);
    };

    const handleSaveExpense = async (expense: Expense) => {
        if (expense.id) {
            await updateExpense(expense.id, expense);
        } else {
            await addExpense(expense);
        }
        setEditingExpense(null);
    };

    const handleOpenDialog = () => {
        setEditingExpense(createEmptyExpense());
    };

    const handleCloseDialog = () => {
        setEditingExpense(null);
    };

    const handleEditExpense = (expense: Expense) => {
        setEditingExpense(expense);
    };

    const handleDeleteExpense = async (id: string) => {
        try {
            await deleteExpense(id);
        } catch (err) {
            logger.error('Error deleting expense:', err);
        }
    };

    if (loading) {
        return <div>{t('loading')}</div>;
    }

    return (
        <div className="container">
            <div className="expense-header-row">
                <button type="button" className="btn primary expense-add-btn" onClick={handleOpenDialog}>
                    <Plus size={18}/> {t("add_expense")}
                </button>
                <button type="button" className="btn secondary expense-filters-toggle"
                        onClick={() => setShowFilters(f => !f)}>
                    {t("filters")} {showFilters ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </button>
            </div>
            {showFilters && (
                <form className="expense-filters" onSubmit={e => {
                    e.preventDefault();
                }}>
                    <div className="expense-filters-row1">
                        <input type="date" value={filters.dateFrom} onChange={e => setFilter('dateFrom', e.target.value)}
                               placeholder={t("start_date")} title={t("start_date")}/>
                        <input type="date" value={filters.dateTo} onChange={e => setFilter('dateTo', e.target.value)}
                               placeholder={t("end_date")} title={t("end_date")}/>
                        <button type="button" className="btn secondary expense-filters-reset" onClick={() => {
                            resetFilters();
                            setCurrentPage(1);
                        }}><RotateCcw size={16}/>{t("reset_filters")}</button>
                    </div>
                    <div className="expense-filters-row2">
                        <select value={filters.product} onChange={e => setFilter('product', e.target.value)}
                                title={t("product")}>
                            <option value="">{t("all_products")}</option>
                            {uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <select value={filters.itemType} onChange={e => setFilter('itemType', e.target.value)}
                                title={t("item_type")}>
                            <option value="">{t("all_item_types")}</option>
                            {uniqueItemTypes.map(it => <option key={it} value={it}>{it}</option>)}
                        </select>
                        <select value={filters.series} onChange={e => setFilter('series', e.target.value)}
                                title={t("series")}>
                            <option value="">{t("all_series")}</option>
                            {uniqueSeries.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={filters.marketplace} onChange={e => setFilter('marketplace', e.target.value)}
                                title={t("marketplace")}>
                            <option value="">{t("all_marketplaces")}</option>
                            {uniqueMarketplaces.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={filters.seller} onChange={e => setFilter('seller', e.target.value)}
                                title={t("seller")}>
                            <option value="">{t("all_sellers")}</option>
                            {uniqueSellers.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </form>
            )}

            <ExpenseDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onSave={handleSaveExpense}
                initialData={editingExpense ?? undefined}
                key={dialogOpen ? (editingExpense?.id || 'new') : 'closed'}
                authMode={authMode}
            />

            <ExpenseTable
                expenses={paginatedExpenses}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
                loading={loading}
                error={error}
                sortKey={sortKey}
                sortAsc={sortAsc}
                onSortChange={handleSortChange}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                onNextPage={handleNextPage}
                onPrevPage={handlePrevPage}
                onPageSizeChange={handlePageSizeChange}
                onPageChange={handlePageChange}
                authMode={authMode}
            />
        </div>
    );
}
