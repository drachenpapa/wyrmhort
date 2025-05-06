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
    return (
        <div className="pagination-controls">
            <div className="page-size-select">
                <label htmlFor="pageSize">Elemente pro Seite:</label>
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

            <div className="page-buttons">
                <button onClick={onPrevPage} disabled={currentPage === 1}>
                    ← Zurück
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

                <button onClick={onNextPage} disabled={currentPage === totalPages}>
                    Weiter →
                </button>
            </div>
        </div>
    );
}
