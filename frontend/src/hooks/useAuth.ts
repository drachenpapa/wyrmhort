import {onAuthStateChanged, signInWithPopup, signOut, User} from 'firebase/auth';
import {useEffect, useState} from 'react';

import {auth, provider} from '../firebase';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, setUser);
        return () => unsub();
    }, []);

    const login = async (): Promise<void> => {
        try {
            await signInWithPopup(auth, provider);
        } catch (err) {
            console.error('Login failed:', err);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await signOut(auth);
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    return {user, login, logout};
}
