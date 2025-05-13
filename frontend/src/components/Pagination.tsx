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
};

export default function Pagination({
                                       currentPage,
                                       totalPages,
                                       pageSize,
                                       onPageChange,
                                       onNextPage,
                                       onPrevPage,
                                       onPageSizeChange
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
                    {[10, 20, 50].map((size) => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
            </div>

            <div className="btn-container">
                <button className="btn secondary" onClick={onPrevPage} disabled={currentPage === 1}>
                    <ArrowLeft size={18}/>
                    {t("previous")}
                </button>

                {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            disabled={pageNum === currentPage}
                            style={{
                                fontWeight: pageNum === currentPage ? 'bold' : 'normal',
                                textDecoration: pageNum === currentPage ? 'underline' : 'none'
                            }}
                        >
                            {pageNum}
                        </button>
                    );
                })}

                <button className="btn secondary" onClick={onNextPage}
                        disabled={currentPage === totalPages || totalPages === 0}>
                    {t("next")}
                    <ArrowRight size={18}/>
                </button>
            </div>
        </div>
    );
}
