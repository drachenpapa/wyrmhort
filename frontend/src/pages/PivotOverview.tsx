import {useState} from "react";
import useApiExpenses from "../hooks/useApiExpenses";
import {useTranslation} from "react-i18next";
import "../styles.css";
import {Expense} from "../types/Expense";
import {useAuth} from "../hooks/useAuth";

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

    if (!expenses || expenses.length === 0) {
        return <div className="pivot-empty">{t("no_data")}</div>;
    }

    const grouped = expenses.reduce<GroupedExpenses>((acc, exp) => {
        const prod = exp.product || t("unknown");
        const type = exp.item_type || t("unknown");
        const ser = exp.series || t("unknown");
        acc[prod] = acc[prod] || {};
        acc[prod][type] = acc[prod][type] || {};
        acc[prod][type][ser] = acc[prod][type][ser] || [];
        acc[prod][type][ser].push(exp);
        return acc;
    }, {});

    const toggle = (key: string) =>
        setOpenGroups((prev) => ({...prev, [key]: !prev[key]}));

    const sum = (items: Expense[]) => items.reduce((a, b) => a + b.amount, 0);
    const grandTotal = sum(expenses);

    return (
        <div className="pivot-overview">
            {Object.entries(grouped).map(([product, types]) => {
                const pKey = `prod-${product}`;
                const pTotal = Object.values(types)
                    .flatMap((m) => Object.values(m).flat())
                    .reduce((a, b) => a + b.amount, 0);

                return (
                    <div key={product} className="pivot-group">
                        <div className="pivot-group-header" onClick={() => toggle(pKey)}>
                            <span className="pivot-toggle">{openGroups[pKey] ? "−" : "+"}</span>
                            <span className="pivot-title">{product}</span>
                            <span className="pivot-total">{pTotal.toLocaleString('de-DE', {
                                style: 'currency',
                                currency: 'EUR'
                            })}</span>
                        </div>

                        {openGroups[pKey] && (
                            <div className="pivot-subgroup">
                                {Object.entries(types).map(([itemType, series]) => {
                                    const tKey = `${pKey}-${itemType}`;
                                    const tTotal = Object.values(series)
                                        .flat()
                                        .reduce((a, b) => a + b.amount, 0);

                                    return (
                                        <div key={itemType} className="pivot-group">
                                            <div className="pivot-group-header" onClick={() => toggle(tKey)}>
                                                <span className="pivot-toggle">{openGroups[tKey] ? "−" : "+"}</span>
                                                <span className="pivot-title">{itemType}</span>
                                                <span className="pivot-total">{tTotal.toLocaleString('de-DE', {
                                                    style: 'currency',
                                                    currency: 'EUR'
                                                })}</span>
                                            </div>
                                            {openGroups[tKey] && (
                                                <div className="pivot-subgroup">
                                                    {Object.entries(series).map(
                                                        ([serie, items]) => {
                                                            const date = new Date(items[0].date).toLocaleDateString("de-DE", {
                                                                year: "numeric",
                                                                month: "long"
                                                            });
                                                            const sTotal = sum(items);

                                                            return (
                                                                <div key={serie} className="pivot-series-row">
                                                                    <span
                                                                        className="pivot-series-title">{serie} ({date})</span>
                                                                    <span
                                                                        className="pivot-series-total">{sTotal.toLocaleString('de-DE', {
                                                                        style: 'currency',
                                                                        currency: 'EUR'
                                                                    })}</span>
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="pivot-grand-total">
                {t("grand_total")}: {grandTotal.toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})}
            </div>
        </div>
    );
}
