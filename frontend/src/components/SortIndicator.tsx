import React from 'react';

type SortIndicatorProps = {
    active: boolean;
    asc: boolean;
};

const SortIndicator = React.memo(({active, asc}: SortIndicatorProps) => {
    if (!active) return null;
    return <span style={{marginLeft: 4}}>{asc ? '▲' : '▼'}</span>;
});

export default SortIndicator;
