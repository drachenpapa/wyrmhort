import {useEffect, useState} from 'react';
import {addDoc, collection, deleteDoc, doc, getDocs, updateDoc} from 'firebase/firestore';
import {db} from '../firebase';
import {Expense} from '../types/Expense';

export default function useFirestoreExpenses(user: any) {
    const [expenses, setExpenses] = useState<Expense[]>([]);

    useEffect(() => {
        if (!user) return;
        const fetchExpenses = async () => {
            const snapshot = await getDocs(collection(db, 'users', user.uid, 'expenses'));
            const data = snapshot.docs.map((docSnap) => ({
                id: docSnap.id,
                ...docSnap.data()
            })) as Expense[];
            setExpenses(data);
        };
        fetchExpenses();
    }, [user]);

    const addExpense = async (expense: Omit<Expense, 'id'>) => {
        const docRef = await addDoc(collection(db, 'users', user.uid, 'expenses'), expense);
        setExpenses((prev) => [...prev, {...expense, id: docRef.id}]);
    };

    const updateExpense = async (id: string, updated: Partial<Expense>) => {
        const ref = doc(db, 'users', user.uid, 'expenses', id);
        await updateDoc(ref, updated);
        setExpenses((prev) => prev.map((e) => (e.id === id ? {...e, ...updated} : e)));
    };

    const deleteExpense = async (id: string) => {
        await deleteDoc(doc(db, 'users', user.uid, 'expenses', id));
        setExpenses((prev) => prev.filter((e) => e.id !== id));
    };

    return {expenses, addExpense, updateExpense, deleteExpense};
}
