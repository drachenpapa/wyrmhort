import {ChevronDown, ChevronUp} from 'lucide-react';
import {memo} from 'react';

type SortIndicatorProps = {
    active: boolean;
    asc: boolean;
};

function SortIndicator({active, asc}: SortIndicatorProps) {
    if (!active) return null;
    return (
        <span className="sort-indicator">
            {asc ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
        </span>
    );
}

export default memo(SortIndicator);
