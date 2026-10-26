import {fireEvent, render, screen} from '@testing-library/react';
import {vi} from 'vitest';

import LanguageSwitch from '../LanguageSwitch';

vi.mock('../../i18n', () => ({
    default: {language: 'de', changeLanguage: vi.fn()},
}));

describe('<LanguageSwitch/>', () => {
    it('renders the German and British flag icons', () => {
        render(<LanguageSwitch/>);

        expect(screen.getByRole('button', {name: 'Switch to English'})).toBeInTheDocument();
        expect(document.querySelector('.fi-de')).toBeInTheDocument();
        expect(document.querySelector('.fi-gb')).toBeInTheDocument();
        expect(document.querySelector('.flag-left.fi-de')).toBeInTheDocument();
        expect(document.querySelector('.flag-right.fi-gb')).toBeInTheDocument();
    });

    it('diagonally swaps the flags when clicked', () => {
        render(<LanguageSwitch/>);

        fireEvent.click(screen.getByRole('button', {name: 'Switch to English'}));

        expect(screen.getByRole('button', {name: 'Wechsel zu Deutsch'})).toBeInTheDocument();
        expect(document.querySelector('.flag-left.fi-gb')).toBeInTheDocument();
        expect(document.querySelector('.flag-right.fi-de')).toBeInTheDocument();
    });
});
