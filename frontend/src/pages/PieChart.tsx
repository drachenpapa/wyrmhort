import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip} from 'recharts';

import {LoadingSpinner} from '../components/LoadingSpinner';
import useApiExpenses from '../hooks/useApiExpenses';
import {useAuth} from '../hooks/useAuth';
import {logger} from '../logger';
import '../styles.css';
import {Expense} from '../types/Expense';
import {ExpenseFilters} from '../types/ExpenseFilters';

interface PieChartData {
    name: string;
    value: number;
    color: string;
}

const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
    '#82CA9D', '#FFC658', '#8DD1E1', '#D084D0', '#A4DE6C',
    '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#F7DC6F'
];

export default function PieChart() {
    const {user, authMode} = useAuth();
    const {expenses, fetchExpenses, loading, error} = useApiExpenses(user, authMode);
    const {t} = useTranslation();
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [filters, setFilters] = useState<ExpenseFilters>({
        start_date: '', end_date: ''
    });

    useEffect(() => {
        if ((user && user.email) || authMode === 'demo') {
            fetchExpenses(filters).catch((err) => {
                logger.error('Error fetching expenses:', err);
            });
        }
    }, [user, authMode, fetchExpenses, filters]);

    const onPieClick = (data: PieChartData) => {
        if (selectedProduct === data.name) {
            setSelectedProduct(null);
        } else {
            setSelectedProduct(data.name);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFilters(prev => ({...prev, [name]: value}));
    };

    const handleApplyFilters = () => {
        setSelectedProduct(null);
        fetchExpenses(filters).catch((err) => {
            logger.error('Error fetching expenses with filters:', err);
        });
    };

    const handleBackToProducts = () => {
        setSelectedProduct(null);
    };

    const getChartData = (): PieChartData[] => {
        const dataMap = new Map<string, number>();

        if (selectedProduct) {
            expenses
                .filter((expense: Expense) => (expense.product || t("unknown")) === selectedProduct)
                .forEach((expense: Expense) => {
                    const key = expense.item_type || t("unknown");
                    dataMap.set(key, (dataMap.get(key) || 0) + Number(expense.amount));
                });
        } else {
            expenses.forEach((expense: Expense) => {
                const key = expense.product || t("unknown");
                dataMap.set(key, (dataMap.get(key) || 0) + Number(expense.amount));
            });
        }

        return Array.from(dataMap.entries())
            .map(([name, value], index) => ({
                name,
                value,
                color: COLORS[index % COLORS.length]
            }))
            .sort((a, b) => b.value - a.value);
    };

    const chartData = getChartData();

    const grandTotal = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="pivot-overview">
            <div className="filters">
                <label>
                    {t("start_date")}
                    <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange}/>
                </label>
                <label>
                    {t("end_date")}
                    <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange}/>
                </label>
                <button className="btn primary" onClick={handleApplyFilters}>{t("apply_filters")}</button>
            </div>

            {loading && <LoadingSpinner/>}
            {error && <div className="error-message"><p>{t("error_loading_data")}</p></div>}
            {!loading && !error && expenses.length === 0 && (
                <div>{t("no_expenses_found")}</div>
            )}

            {!loading && !error && expenses.length > 0 && (
                <>
                    <div className="piechart-controls">
                        {selectedProduct && (
                            <button className="btn secondary" onClick={handleBackToProducts} style={{marginRight: 'auto'}}>
                                {t("back_to_products")}
                            </button>
                        )}
                        <div className="pivot-grand-total">
                            {t("grand_total")}: {grandTotal.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={500}>
                        <RechartsPieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({name, value}) => `${name}: ${value.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}`}
                                outerRadius={150}
                                fill="#8884d8"
                                dataKey="value"
                                onClick={selectedProduct ? undefined : (_, index) => onPieClick(chartData[index])}
                                style={selectedProduct ? undefined : {cursor: 'pointer'}}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color}/>
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: unknown) => {
                                    const numValue = typeof value === 'number' ? value : Number(value);
                                    return numValue.toLocaleString('de-DE', {
                                        style: 'currency',
                                        currency: 'EUR'
                                    });
                                }}
                            />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </>
            )}
        </div>
    );
}
