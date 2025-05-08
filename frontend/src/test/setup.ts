import '@testing-library/jest-dom';
import {logger} from '../logger';

globalThis.fetch = vi.fn();

vi.spyOn(logger, 'info').mockImplementation(() => {
});
vi.spyOn(logger, 'warn').mockImplementation(() => {
});
vi.spyOn(logger, 'error').mockImplementation(() => {
});
vi.spyOn(logger, 'debug').mockImplementation(() => {
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            changeLanguage: vi.fn(),
        },
    }),
}));
