import {act, renderHook} from '@testing-library/react';
import {signInWithPopup, signOut, User} from 'firebase/auth';
import {vi} from 'vitest';

import {useAuth} from '../useAuth';

const mockUser = {uid: '123', email: 'test@example.com'} as User;
const mockUnsubscribe = vi.fn();

vi.mock('firebase/auth', async () => {
    const actual = await vi.importActual<typeof import('firebase/auth')>('firebase/auth');
    return {
        ...actual,
        getAuth: vi.fn(() => ({
            currentUser: {uid: '123', email: 'test@example.com'},
        })),
        onAuthStateChanged: vi.fn((_auth, callback) => {
            callback({uid: '123', email: 'test@example.com'});
            return mockUnsubscribe;
        }),
        signInWithPopup: vi.fn(),
        signOut: vi.fn(),
    };
});

describe('useAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should set user on auth state change', () => {
        const {result} = renderHook(() => useAuth());
        expect(result.current.user).toEqual(mockUser);
    });

    it('should login', async () => {
        const {result} = renderHook(() => useAuth());

        await act(async () => {
            await result.current.login();
        });

        await expect(signInWithPopup).toHaveBeenCalled();
    });

    it('should logout', async () => {
        const {result} = renderHook(() => useAuth());

        await act(async () => {
            await result.current.logout();
        });

        await expect(signOut).toHaveBeenCalled();
    });

    it('should unsubscribe on unmount', () => {
        const {unmount} = renderHook(() => useAuth());
        unmount();
        expect(mockUnsubscribe).toHaveBeenCalled();
    });
});
