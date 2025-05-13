import {LogOut} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {Navigate, Route, Routes} from 'react-router-dom';

import Tabs from './components/Tabs';
import {useAuth} from './hooks/useAuth';
import {logger} from './logger';
import ExpensesView from './pages/ExpensesView';
import Login from './pages/Login';
import PivotOverview from './pages/PivotOverview';

export default function App() {
    const {user, login, logout} = useAuth();
    const {t} = useTranslation()
    const allowedEmail = import.meta.env.VITE_ALLOWED_EMAIL;
    const isOwner = user?.email === allowedEmail;

    if (user) {
        logger.info("User detected", user);
        if (!isOwner) {
            logger.warn("Unauthorized user tried to access app", user.email);
        }
    }

    return (
        <div className="container">
            <h1>Wyrmhort</h1>
            {user && isOwner ? (
                <>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '1rem',
                        alignItems: 'center'
                    }}>
                        <h2>{t("greeting", {name: user.displayName})}</h2>
                        <button className="btn secondary" onClick={logout}>
                            <LogOut size={18}/>
                            {t("logout")}
                        </button>
                    </div>
                    <Tabs/>
                    <Routes>
                        <Route path="/" element={<Navigate to="/expenses" replace/>}/>
                        <Route path="/expenses" element={<ExpensesView/>}/>
                        <Route path="/overview" element={<PivotOverview/>}/>
                    </Routes>
                </>
            ) : user && !isOwner ? (
                <p>{t("access_denied")}</p>
            ) : (
                <Login onLogin={login}/>
            )}
        </div>
    );
}
