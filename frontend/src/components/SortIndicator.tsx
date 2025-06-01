import {ChevronDown, ChevronUp} from 'lucide-react';
import React from 'react';

type SortIndicatorProps = {
    active: boolean;
    asc: boolean;
};

const SortIndicator = React.memo(({active, asc}: SortIndicatorProps) => {
    if (!active) return null;
    return (
        <span className="sort-indicator">
            {asc ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
        </span>
    );
});

export default SortIndicator;
