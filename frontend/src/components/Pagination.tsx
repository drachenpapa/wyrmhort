import {ArrowLeft, ArrowRight} from "lucide-react";
import {useTranslation} from 'react-i18next';

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onNextPage: () => void;
    onPrevPage: () => void;
    onPageSizeChange: (size: number) => void;
    pageSizeOptions?: number[];
};

export default function Pagination({
                                       currentPage,
                                       totalPages,
                                       pageSize,
                                       onPageChange,
                                       onNextPage,
                                       onPrevPage,
                                       onPageSizeChange,
                                       pageSizeOptions = [10, 20, 50],
                                   }: PaginationProps) {
    const {t} = useTranslation();

    return (
        <div className="pagination-controls">
            <div className="page-size-select">
                <label htmlFor="pageSize">{t("items_per_page")}</label>
                <select
                    id="pageSize"
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                    {pageSizeOptions.map((size) => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
            </div>

            <div className="btn-container">
                <button type="button" className="btn secondary" onClick={onPrevPage} disabled={currentPage === 1}>
                    <ArrowLeft size={18}/>
                    {t("previous")}
                </button>

                <div className="page-select-wrapper">
                    {t("page")}
                    <select id="pageSelect" value={currentPage} onChange={(e) => onPageChange(Number(e.target.value))}
                            className="page-select">
                        {Array.from({length: totalPages}, (_, idx) => (
                            <option key={idx + 1} value={idx + 1}>{idx + 1}</option>
                        ))}
                    </select>
                    <span className="page-total">/ {totalPages}</span>
                </div>

                <button type="button" className="btn secondary" onClick={onNextPage}
                        disabled={currentPage === totalPages}>
                    {t("next")}
                    <ArrowRight size={18}/>
                </button>
            </div>
        </div>
    );
}
