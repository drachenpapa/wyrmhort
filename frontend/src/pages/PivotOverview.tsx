import {useState} from "react";
import useApiExpenses from "../hooks/useApiExpenses";
import {useTranslation} from "react-i18next";
import "../styles.css";
import {Expense} from "../types/Expense";
import {useAuth} from "../hooks/useAuth.ts";
import {LoadingSpinner} from "../components/LoadingSpinner.tsx";

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
    const {user} = useAuth();
    const {expenses, loading, error} = useApiExpenses(user);
    const {t} = useTranslation();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    if (loading) return <LoadingSpinner/>;
    if (error) return <div className="error-message"><p>{t('error_loading_data')}</p></div>;
    if (!expenses || expenses.length === 0) return <div>{t("no_expenses_found")}</div>;

    const grouped = expenses.reduce<GroupedExpenses>((acc, expense) => {
        const product = safeKey(expense.product || t("unknown"));
        const itemType = safeKey(expense.item_type || t("unknown"));
        const serie = safeKey(expense.series || t("unknown"));

        acc[product] ??= {};
        acc[product][itemType] ??= {};
        acc[product][itemType][serie] ??= [];

        acc[product][itemType][serie].push(expense);
        return acc;
    }, {});

    const toggle = (key: string) => {
        setOpenGroups((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const calculateTotal = (items: Expense[]) =>
        items.reduce((sum, item) => sum + (item.amount || 0), 0);

    const grandTotal = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);

    return (
        <div className="pivot-overview">
            {Object.entries(grouped).map(([product, itemTypes]) => {
                const productKey = safeKey(`product-${product}`);
                const productTotal = Object.values(itemTypes)
                    .flatMap((series) => Object.values(series).flat())
                    .reduce((sum, item) => sum + (item.amount || 0), 0);

                return (
                    <div key={productKey} className="pivot-group">
                        <div className="pivot-group-header" onClick={() => toggle(productKey)}>
                            <span className="pivot-toggle">{openGroups[productKey] ? "-" : "+"}</span>
                            <span className="pivot-title">{product}</span>
                            <span className="pivot-total">{productTotal.toFixed(2)} €</span>
                        </div>

                        <div className={`pivot-subgroup ${openGroups[productKey] ? "open" : ""}`}>
                            {Object.entries(itemTypes).map(([itemType, series]) => {
                                const itemTypeKey = safeKey(`${productKey}-itemType-${itemType}`);
                                const itemTypeTotal = Object.values(series)
                                    .flat()
                                    .reduce((sum, item) => sum + (item.amount || 0), 0);

                                return (
                                    <div key={itemTypeKey} className="pivot-group">
                                        <div className="pivot-group-header" onClick={() => toggle(itemTypeKey)}>
                                            <span className="pivot-toggle">{openGroups[itemTypeKey] ? "-" : "+"}</span>
                                            <span className="pivot-title">{itemType}</span>
                                            <span className="pivot-total">{itemTypeTotal.toFixed(2)} €</span>
                                        </div>

                                        <div className={`pivot-subgroup ${openGroups[itemTypeKey] ? "open" : ""}`}>
                                            {Object.entries(series).map(([serie, items]) => {
                                                const serieKey = safeKey(`${itemTypeKey}-serie-${serie}`);
                                                const serieTotal = calculateTotal(items);

                                                return (
                                                    <div key={serieKey} className="pivot-group">
                                                        <div className="pivot-group-header">
                                                            <span className="pivot-title">{serie}</span>
                                                            <span
                                                                className="pivot-total">{serieTotal.toFixed(2)} €</span>
                                                        </div>

                                                        <div
                                                            className={`pivot-subgroup ${openGroups[serieKey] ? "open" : ""}`}>
                                                            {items.map((item) => (
                                                                <div key={item.id} className="pivot-item">
                                                                    <span className="pivot-item-amount">
                                                                        {item.amount.toFixed(2)} €
                                                                    </span>
                                                                </div>
                                                            ))}
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
            })}

            <div className="pivot-grand-total">
                {t("grand_total")}: {grandTotal.toFixed(2)} €
            </div>
        </div>
    );
}
