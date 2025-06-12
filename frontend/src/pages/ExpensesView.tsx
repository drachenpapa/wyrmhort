import {ChevronDown, ChevronUp, Plus, RotateCcw} from 'lucide-react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';

import ExpenseDialog from '../components/ExpenseDialog';
import ExpenseTable from '../components/ExpenseTable';
import useApiExpenses from '../hooks/useApiExpenses';
import {useAuth} from '../hooks/useAuth';
import {logger} from '../logger';
import {Expense} from '../types/Expense';

const emptyExpense: Expense = {
    id: '',
    date: new Date().toISOString().slice(0, 10),
    amount: 0,
    product: '',
    item_type: '',
    series: '',
    quantity: 1,
    seller: '',
    marketplace: undefined
};

export default function ExpensesView() {
    const {user} = useAuth();
    const {t} = useTranslation();
    const {
        expenses,
        fetchExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        loading,
        error,
        token
    } = useApiExpenses(user);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const dialogOpen = editingExpense !== null;
    const [sortKey, setSortKey] = useState<string>("date");
    const [sortAsc, setSortAsc] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [filterDateFrom, setFilterDateFrom] = useState<string>("");
    const [filterDateTo, setFilterDateTo] = useState<string>("");
    const [filterProduct, setFilterProduct] = useState<string>("");
    const [filterItemType, setFilterItemType] = useState<string>("");
    const [filterSeries, setFilterSeries] = useState<string>("");
    const [filterMarketplace, setFilterMarketplace] = useState<string>("");
    const [filterSeller, setFilterSeller] = useState<string>("");
    const [showFilters, setShowFilters] = useState(false);

    const expenseMatchesFilters = useCallback((exp: Expense, ignore: (keyof Expense)[] = []) => {
        const date = exp.date.slice(0, 10);
        const checks = [
            (!filterDateFrom || ignore.includes('date') || date >= filterDateFrom),
            (!filterDateTo || ignore.includes('date') || date <= filterDateTo),
            (!filterProduct || ignore.includes('product') || (exp.product?.toLowerCase() === filterProduct.toLowerCase())),
            (!filterItemType || ignore.includes('item_type') || (exp.item_type?.toLowerCase() === filterItemType.toLowerCase())),
            (!filterSeries || ignore.includes('series') || (exp.series?.toLowerCase() === filterSeries.toLowerCase())),
            (!filterMarketplace || ignore.includes('marketplace') || ((exp.marketplace || '').toLowerCase() === filterMarketplace.toLowerCase())),
            (!filterSeller || ignore.includes('seller') || (exp.seller?.toLowerCase() === filterSeller.toLowerCase()))
        ];
        return checks.every(Boolean);
    }, [filterDateFrom, filterDateTo, filterProduct, filterItemType, filterSeries, filterMarketplace, filterSeller]);

    const getFilteredExpenses = useCallback((ignore: keyof Expense | null = null) => {
        return expenses.filter(exp => expenseMatchesFilters(exp, ignore ? [ignore] : []));
    }, [expenses, expenseMatchesFilters]);

    const filteredExpenses = getFilteredExpenses();

    const uniqueProducts = useMemo(() =>
            Array.from(new Set(getFilteredExpenses('product').map(e => e.product).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
        [getFilteredExpenses]
    );
    const uniqueItemTypes = useMemo(() =>
            Array.from(new Set(getFilteredExpenses('item_type').map(e => e.item_type).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
        [getFilteredExpenses]
    );
    const uniqueSeries = useMemo(() =>
            Array.from(new Set(getFilteredExpenses('series').map(e => e.series).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
        [getFilteredExpenses]
    );
    const uniqueMarketplaces = useMemo(() =>
            Array.from(new Set(getFilteredExpenses('marketplace').map(e => e.marketplace).filter((v): v is string => !!v))).sort((a, b) => a.localeCompare(b)),
        [getFilteredExpenses]
    );
    const uniqueSellers = useMemo(() =>
            Array.from(new Set(getFilteredExpenses('seller').map(e => e.seller).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
        [getFilteredExpenses]
    );

    const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / pageSize));
    const paginatedExpenses = filteredExpenses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    useEffect(() => {
        if (user && token) {
            fetchExpenses({sortKey, sortAsc}).catch((err) => {
                logger.error('Error fetching expenses:', err);
            });
        }
    }, [user, token, fetchExpenses, sortKey, sortAsc]);

    useEffect(() => {
        setCurrentPage((prev) => Math.min(Math.max(prev, 1), totalPages));
    }, [filteredExpenses.length, totalPages]);

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
        setEditingExpense({...emptyExpense});
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

    if (!user) return <p>{t("login")}</p>;

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
                        <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)}
                               placeholder={t("start_date")} title={t("start_date")}/>
                        <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)}
                               placeholder={t("end_date")} title={t("end_date")}/>
                        <button type="button" className="btn secondary expense-filters-reset" onClick={() => {
                            setFilterDateFrom("");
                            setFilterDateTo("");
                            setFilterProduct("");
                            setFilterItemType("");
                            setFilterSeries("");
                            setFilterMarketplace("");
                            setFilterSeller("");
                            setCurrentPage(1);
                        }}><RotateCcw size={16}/>{t("reset_filters")}</button>
                    </div>
                    <div className="expense-filters-row2">
                        <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)}
                                title={t("product")}>
                            <option value="">{t("all_products")}</option>
                            {uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <select value={filterItemType} onChange={e => setFilterItemType(e.target.value)}
                                title={t("item_type")}>
                            <option value="">{t("all_item_types")}</option>
                            {uniqueItemTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select value={filterSeries} onChange={e => setFilterSeries(e.target.value)}
                                title={t("series")}>
                            <option value="">{t("all_series")}</option>
                            {uniqueSeries.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={filterMarketplace} onChange={e => setFilterMarketplace(e.target.value)}
                                title={t("marketplace")}>
                            <option value="">{t("all_marketplaces")}</option>
                            {uniqueMarketplaces.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={filterSeller} onChange={e => setFilterSeller(e.target.value)}
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
            />
        </div>
    );
}
