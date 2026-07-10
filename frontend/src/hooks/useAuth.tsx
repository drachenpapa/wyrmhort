// AuthProvider and useAuth are intentionally co-located: the provider owns
// the auth state and the hook is the only consumer API. Splitting them into
// separate files adds complexity with no practical benefit for this project.
import {onAuthStateChanged, signInWithPopup, signOut, User} from 'firebase/auth';
import {createContext, ReactNode, useContext, useEffect, useState} from 'react';

import {auth, provider} from '../firebase';
import {logger} from '../logger';

export type AuthMode = 'firebase' | 'demo';

type AuthContextValue = {
    user: User | null;
    authMode: AuthMode;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    loginAsDemo: () => void;
};

const DEMO_USER: User = {
    uid: 'demo',
    email: 'demo@demo.local',
    displayName: 'Demo User',
} as User;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: { children: ReactNode }) {
    const getInitialAuthMode = (): AuthMode => {
        const stored = localStorage.getItem('authMode');
        return stored === 'demo' ? 'demo' : 'firebase';
    };

    const initialAuthMode = getInitialAuthMode();
    const [user, setUser] = useState<User | null>(() =>
        initialAuthMode === 'demo' ? DEMO_USER : null
    );
    const [authMode, setAuthModeState] = useState<AuthMode>(initialAuthMode);

    const setAuthMode = (mode: AuthMode) => {
        localStorage.setItem('authMode', mode);
        setAuthModeState(mode);
    };

    useEffect(() => {
        if (authMode === 'firebase') {
            const unsub = onAuthStateChanged(auth, setUser);
            return () => unsub();
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
        setUser(DEMO_USER);
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

    return (
        <AuthContext.Provider value={{user, authMode, login, logout, loginAsDemo}}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}
