import {Plus} from 'lucide-react';
import {useEffect, useState} from 'react';
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
    const {expenses, fetchExpenses, addExpense, updateExpense, deleteExpense, loading, error, token} = useApiExpenses(user);
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

    const uniqueProducts = Array.from(new Set(expenses.map(e => e.product).filter(Boolean)));
    const uniqueItemTypes = Array.from(new Set(expenses.map(e => e.item_type).filter(Boolean)));
    const uniqueSeries = Array.from(new Set(expenses.map(e => e.series).filter(Boolean)));
    const uniqueMarketplaces = Array.from(new Set(expenses.map(e => e.marketplace).filter(Boolean)));
    const uniqueSellers = Array.from(new Set(expenses.map(e => e.seller).filter(Boolean)));

    const filteredExpenses = expenses.filter(exp => {
        const date = exp.date.slice(0, 10);
        if (filterDateFrom && date < filterDateFrom) return false;
        if (filterDateTo && date > filterDateTo) return false;
        if (filterProduct && !exp.product?.toLowerCase().includes(filterProduct.toLowerCase())) return false;
        if (filterItemType && !exp.item_type?.toLowerCase().includes(filterItemType.toLowerCase())) return false;
        if (filterSeries && !exp.series?.toLowerCase().includes(filterSeries.toLowerCase())) return false;
        if (filterMarketplace && !(exp.marketplace || "").toLowerCase().includes(filterMarketplace.toLowerCase())) return false;
        if (filterSeller && !exp.seller?.toLowerCase().includes(filterSeller.toLowerCase())) return false;
        return true;
    });

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
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

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
        setEditingExpense({ ...emptyExpense });
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
            <button type="button" className="btn" style={{marginBottom: 8}} onClick={() => setShowFilters(f => !f)}>
                {showFilters ? t("hide_filters") || "Filter ausblenden" : t("show_filters") || "Filter anzeigen"}
            </button>
            {showFilters && (
                <form className="expense-filters" style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16}} onSubmit={e => {e.preventDefault();}}>
                    <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} placeholder={t("date_from")} title={t("date_from")} />
                    <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} placeholder={t("date_to")} title={t("date_to")} />
                    <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)} title={t("product") || "Produkt"}>
                        <option value="">{t("all_products") || "Alle Produkte"}</option>
                        {uniqueProducts.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <select value={filterItemType} onChange={e => setFilterItemType(e.target.value)} title={t("item_type") || "Typ"}>
                        <option value="">{t("all_item_types") || "Alle Typen"}</option>
                        {uniqueItemTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select value={filterSeries} onChange={e => setFilterSeries(e.target.value)} title={t("series") || "Serie"}>
                        <option value="">{t("all_series") || "Alle Serien"}</option>
                        {uniqueSeries.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={filterMarketplace} onChange={e => setFilterMarketplace(e.target.value)} title={t("marketplace") || "Marktplatz"}>
                        <option value="">{t("all_marketplaces") || "Alle Marktplatz"}</option>
                        {uniqueMarketplaces.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={filterSeller} onChange={e => setFilterSeller(e.target.value)} title={t("seller") || "Verkäufer"}>
                        <option value="">{t("all_seller") || "Alle Verkäufer"}</option>
                        {uniqueSellers.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </form>)}

            <div className="add-expense-container">
                <button type="button" className="btn primary" onClick={handleOpenDialog}>
                    <Plus size={18}/>
                    {t("add_expense")}
                </button>
            </div>

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
