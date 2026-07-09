import React from 'react';
import {useTranslation} from 'react-i18next';

type Props = {
    startDate: string;
    endDate: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onApply: () => void;
};

export default function DateRangeFilter({startDate, endDate, onChange, onApply}: Props) {
    const {t} = useTranslation();

    return (
        <div className="filters">
            <label>
                {t("start_date")}
                <input type="date" name="start_date" value={startDate} onChange={onChange}/>
            </label>
            <label>
                {t("end_date")}
                <input type="date" name="end_date" value={endDate} onChange={onChange}/>
            </label>
            <button className="btn primary" onClick={onApply}>{t("apply_filters")}</button>
        </div>
    );
}
