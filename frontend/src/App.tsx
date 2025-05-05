import {LogOut} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {Navigate, Route, Routes} from 'react-router-dom';

import Tabs from './components/Tabs';
import {useAuth} from './hooks/useAuth';
import ExpensesView from './pages/ExpensesView';
import Login from './pages/Login';
import PivotOverview from './pages/PivotOverview';

export default function App() {
    const {user, login, logout} = useAuth();
    const {t} = useTranslation()

    return (
        <div className="container">
            <h1>Wyrmhort</h1>
            {user ? (
                <>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
                        <h2>{t('greeting', {name: user.displayName})}</h2>
                        <button className="btn secondary" onClick={logout}>
                            <LogOut size={18}/>
                            {t('logout')}
                        </button>
                    </div>
                    <Tabs/>
                    <Routes>
                        <Route path="/" element={<Navigate to="/expenses" replace/>}/>
                        <Route path="/expenses" element={<ExpensesView/>}/>
                        <Route path="/overview" element={<PivotOverview/>}/>
                    </Routes>
                </>
            ) : (
                <Login onLogin={login}/>
            )}
        </div>
    );
}
