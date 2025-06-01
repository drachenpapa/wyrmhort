import {render} from '@testing-library/react';

import SortIndicator from '../SortIndicator';

describe('<SortIndicator />', () => {
    it('should render the ascending arrow when active and ascending', () => {
        render(<SortIndicator active={true} asc={true}/>);
        expect(document.querySelector('.lucide-chevron-up')).toBeInTheDocument();
    });

    it('should render the descending arrow when active and descending', () => {
        render(<SortIndicator active={true} asc={false}/>);
        expect(document.querySelector('.lucide-chevron-down')).toBeInTheDocument();
    });

    it('should not render anything when not active', () => {
        render(<SortIndicator active={false} asc={true}/>);
        expect(document.querySelector('.lucide-chevron-up')).not.toBeInTheDocument();
        expect(document.querySelector('.lucide-chevron-down')).not.toBeInTheDocument();
    });
});
