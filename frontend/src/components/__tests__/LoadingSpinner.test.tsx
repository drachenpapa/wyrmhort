import {render, screen} from '@testing-library/react';

import {LoadingSpinner} from '../LoadingSpinner';

describe('<LoadingSpinner/>', () => {
    test('renders spinner and loading text', () => {
        render(<LoadingSpinner/>);

        const spinnerContainer = screen.getByText('loading').parentElement;
        expect(spinnerContainer).toHaveClass('spinner-container');
        expect(screen.getByText('loading')).toBeInTheDocument();
    });
});
