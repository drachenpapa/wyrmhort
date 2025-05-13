import React from 'react';

type SortIndicatorProps = {
    active: boolean;
    asc: boolean;
};

const SortIndicator = React.memo(({active, asc}: SortIndicatorProps) => {
    if (!active) return null;
    return <span className="sort-indicator">{asc ? '▲' : '▼'}</span>;
});

export default SortIndicator;
