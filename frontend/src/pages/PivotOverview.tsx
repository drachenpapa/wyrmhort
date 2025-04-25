import {useState} from "react";
import useApiExpenses from "../hooks/useApiExpenses";
import {useTranslation} from "react-i18next";
import "../styles.css";
import {Expense} from "../types/Expense";
import {useAuth} from "../hooks/useAuth.ts";

interface GroupedExpenses {
    [product: string]: {
        [item_type: string]: {
            [series: string]: Expense[];
        };
    };
}

export default function PivotOverview() {
    const {user} = useAuth();
    const {expenses} = useApiExpenses(user);
    const {t} = useTranslation();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    if (!expenses) return <div>{t("no_data")}</div>;

    const grouped = expenses.reduce<GroupedExpenses>((acc, expense) => {
        const product = expense.product || t("unknown");
        const itemType = expense.item_type || t("unknown");
        const serie = expense.series || t("unknown");

        if (!acc[product]) acc[product] = {};
        if (!acc[product][itemType]) acc[product][itemType] = {};
        if (!acc[product][itemType][serie]) acc[product][itemType][serie] = [];

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
                const productKey = `product-${product}`;
                const productTotal = Object.values(itemTypes)
                    .flatMap((series) => Object.values(series).flat())
                    .reduce((sum, item) => sum + (item.amount || 0), 0);

                return (
                    <div key={product} className="pivot-group">
                        <div className="pivot-group-header" onClick={() => toggle(productKey)}>
                            <span className="pivot-toggle">{openGroups[productKey] ? "-" : "+"}</span>
                            <span className="pivot-title">{product}</span>
                            <span className="pivot-total">{productTotal.toFixed(2)} €</span>
                        </div>

                        <div className={`pivot-subgroup ${openGroups[productKey] ? "open" : ""}`}>
                            {Object.entries(itemTypes).map(([itemType, series]) => {
                                const itemTypeKey = `${productKey}-itemType-${itemType}`;
                                const itemTypeTotal = Object.values(series)
                                    .flat()
                                    .reduce((sum, item) => sum + (item.amount || 0), 0);

                                return (
                                    <div key={itemType} className="pivot-group">
                                        <div className="pivot-group-header" onClick={() => toggle(itemTypeKey)}>
                                            <span className="pivot-toggle">{openGroups[itemTypeKey] ? "-" : "+"}</span>
                                            <span className="pivot-title">{itemType}</span>
                                            <span className="pivot-total">{itemTypeTotal.toFixed(2)} €</span>
                                        </div>

                                        <div className={`pivot-subgroup ${openGroups[itemTypeKey] ? "open" : ""}`}>
                                            {Object.entries(series).map(([serie, items]) => {
                                                const serieKey = `${itemTypeKey}-serie-${serie}`;
                                                const serieTotal = calculateTotal(items);

                                                return (
                                                    <div key={serie} className="pivot-group">
                                                        <div className="pivot-group-header"
                                                             onClick={() => toggle(serieKey)}>
                                                            <span
                                                                className="pivot-toggle">{openGroups[serieKey] ? "-" : "+"}</span>
                                                            <span className="pivot-title">{serie}</span>
                                                            <span
                                                                className="pivot-total">{serieTotal.toFixed(2)} €</span>
                                                        </div>

                                                        <div
                                                            className={`pivot-subgroup ${openGroups[serieKey] ? "open" : ""}`}>
                                                            {items.map((item) => (
                                                                <div key={item.id} className="pivot-item">
                                                                    <span
                                                                        className="pivot-item-title">{item.seller}</span>
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
