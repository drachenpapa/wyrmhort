import './PivotOverview.css';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

import DateRangeFilter from '../components/DateRangeFilter';
import {LoadingSpinner} from '../components/LoadingSpinner';
import useApiExpenses from '../hooks/useApiExpenses';
import {useAuth} from '../hooks/useAuth';
import {logger} from '../logger';
import {Expense} from '../types/Expense';
import {ExpenseFilters} from '../types/ExpenseFilters';
import {formatCurrency} from '../utils/expenses';

interface GroupedExpenses {
    [product: string]: {
        [item_type: string]: {
            [series: string]: Expense[];
        };
    };
}

const safeKey = (key: string): string =>
    key.replace(/[\\/:*?"<>|#%]/g, "_").trim();

export default function PivotOverview() {
    const {user, authMode} = useAuth();
    const {expenses, fetchExpenses, loading, error} = useApiExpenses(user, authMode);
    const {t} = useTranslation();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const [pendingFilters, setPendingFilters] = useState<ExpenseFilters>({start_date: '', end_date: ''});
    const [appliedFilters, setAppliedFilters] = useState<ExpenseFilters>({start_date: '', end_date: ''});

    useEffect(() => {
        if ((user && user.email) || authMode === 'demo') {
            fetchExpenses(appliedFilters).catch((err) => {
                logger.error('Error fetching expenses:', err);
            });
        }
    }, [user, authMode, fetchExpenses, appliedFilters]);

    const grouped = expenses.reduce<GroupedExpenses>((acc, expense) => {
        const product = safeKey(expense.product || t("unknown"));
        const itemType = safeKey(expense.item_type || t("unknown"));
        const series = safeKey(expense.series || t("unknown"));

        acc[product] ??= {};
        acc[product][itemType] ??= {};
        acc[product][itemType][series] ??= [];

        acc[product][itemType][series].push(expense);
        return acc;
    }, {});

    const toggle = (key: string) => {
        setOpenGroups((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const getFormattedAmount = formatCurrency;

    const calculateTotal = (items: Expense[]) =>
        items.reduce((sum, item) => sum + Number(item.amount), 0);

    const grandTotal = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setPendingFilters(prev => ({...prev, [name]: value}));
    };

    const handleApplyFilters = () => {
        setAppliedFilters(pendingFilters);
    };

    return (
        <div className="pivot-overview">
            <DateRangeFilter
                startDate={pendingFilters.start_date ?? ''}
                endDate={pendingFilters.end_date ?? ''}
                onChange={handleFilterChange}
                onApply={handleApplyFilters}
            />
            {loading && <LoadingSpinner/>}
            {error && <div className="error-message"><p>{t("error_loading_data")}</p></div>}
            {!loading && !error && expenses.length === 0 && (
                <div>{t("no_expenses_found")}</div>
            )}
            {!loading && !error && expenses.length > 0 && (
                Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([product, itemTypes]) => {
                    const productKey = safeKey(`product-${product}`);
                    const productTotal = Object.values(itemTypes)
                        .flatMap((series) => Object.values(series).flat())
                        .reduce((sum, item) => sum + Number(item.amount), 0);

                    return (
                        <div key={productKey} className="pivot-group">
                            <div className="pivot-group-header" onClick={() => toggle(productKey)}>
                                <span className="pivot-toggle">{openGroups[productKey] ? "-" : "+"}</span>
                                <span className="pivot-title">{product}</span>
                                <span className="pivot-total">{getFormattedAmount(productTotal)}</span>
                            </div>

                            <div className={`pivot-subgroup ${openGroups[productKey] ? "open" : ""}`}>
                                {Object.entries(itemTypes).sort(([a], [b]) => a.localeCompare(b)).map(([itemType, series]) => {
                                    const itemTypeKey = safeKey(`${productKey}-itemType-${itemType}`);
                                    const itemTypeTotal = Object.values(series)
                                        .flat()
                                        .reduce((sum, item) => sum + Number(item.amount), 0);

                                    return (
                                        <div key={itemTypeKey} className="pivot-group">
                                            <div className="pivot-group-header" onClick={() => toggle(itemTypeKey)}>
                                                <span
                                                    className="pivot-toggle">{openGroups[itemTypeKey] ? "-" : "+"}</span>
                                                <span className="pivot-title">{itemType}</span>
                                                <span className="pivot-total">{getFormattedAmount(itemTypeTotal)}</span>
                                            </div>

                                            <div className={`pivot-subgroup ${openGroups[itemTypeKey] ? "open" : ""}`}>
                                                {Object.entries(series).sort(([a], [b]) => a.localeCompare(b)).map(([series, items]) => {
                                                    const seriesKey = safeKey(`${itemTypeKey}-series-${series}`);
                                                    const seriesTotal = calculateTotal(items);

                                                    return (
                                                        <div key={seriesKey} className="pivot-group">
                                                            <div className="pivot-group-series">
                                                                <span className="pivot-title">{series}</span>
                                                                <span
                                                                    className="pivot-total">{getFormattedAmount(seriesTotal)}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                }))}

            <div className="pivot-grand-total">
                {t("grand_total")}: {getFormattedAmount(grandTotal)}
            </div>
        </div>
    );
}
