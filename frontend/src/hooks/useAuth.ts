import {useEffect, useState} from 'react';
import {onAuthStateChanged, signInWithPopup, signOut, User} from 'firebase/auth';
import {auth, provider} from '../firebase';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, setUser);
        return () => unsub();
    }, []);

    const login = () => signInWithPopup(auth, provider);
    const logout = () => signOut(auth);

    return {user, login, logout};
}
