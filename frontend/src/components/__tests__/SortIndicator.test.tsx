import {render, screen} from '@testing-library/react';

import SortIndicator from '../SortIndicator';

describe('<SortIndicator />', () => {
    it('should render the ascending arrow when active and ascending', () => {
        render(<SortIndicator active={true} asc={true}/>);
        expect(screen.getByText('▲')).toBeInTheDocument();
    });

    it('should render the descending arrow when active and descending', () => {
        render(<SortIndicator active={true} asc={false}/>);
        expect(screen.getByText('▼')).toBeInTheDocument();
    });

    it('should not render anything when not active', () => {
        render(<SortIndicator active={false} asc={true}/>);
        expect(screen.queryByText('▲')).not.toBeInTheDocument();
        expect(screen.queryByText('▼')).not.toBeInTheDocument();
    });
});
