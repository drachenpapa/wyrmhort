import {onAuthStateChanged, signInWithPopup, signOut, User} from 'firebase/auth';
import {useEffect, useState} from 'react';

import {auth, provider} from '../firebase';
import {logger} from '../logger';

export type AuthMode = 'firebase' | 'demo';

const DEMO_USER: User = {
    uid: 'demo',
    email: 'demo@demo.local',
    displayName: 'Demo User',
} as User;

export function useAuth() {
    const getInitialAuthMode = (): AuthMode => {
        const stored = localStorage.getItem('authMode');
        return stored === 'demo' ? 'demo' : 'firebase';
    };
    const [user, setUser] = useState<User | null>(null);
    const [authMode, setAuthModeState] = useState<AuthMode>(getInitialAuthMode());
    const setAuthMode = (mode: AuthMode) => {
        localStorage.setItem('authMode', mode);
        setAuthModeState(mode);
    };

    useEffect(() => {
        if (authMode === 'firebase') {
            const unsub = onAuthStateChanged(auth, setUser);
            return () => unsub();
        } else {
            setUser(DEMO_USER);
            return () => setUser(null);
        }
    }, [authMode]);

    const login = async (): Promise<void> => {
        try {
            await signInWithPopup(auth, provider);
        } catch (err) {
            logger.error('Login failed:', err);
        }
    };

    const loginAsDemo = () => {
        setAuthMode('demo');
    };

    const logout = async (): Promise<void> => {
        if (authMode === 'demo') {
            setAuthMode('firebase');
            setUser(null);
        } else {
            try {
                await signOut(auth);
            } catch (err) {
                logger.error('Logout failed:', err);
            }
        }
    };

    return {user, login, logout, loginAsDemo, authMode};
}
