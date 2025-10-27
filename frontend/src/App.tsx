import {AlertTriangle, LogOut} from 'lucide-react';
import {useEffect, useState} from "react";
import {useTranslation} from 'react-i18next';
import {Navigate, Route, Routes} from 'react-router-dom';

import DarkModeToggle from './components/DarkModeToggle';
import Footer from './components/Footer';
import LanguageSwitch from "./components/LanguageSwitch";
import Tabs from './components/Tabs';
import {useAuth} from './hooks/useAuth';
import {logger} from './logger';
import ExpensesView from './pages/ExpensesView';
import Login from './pages/Login';
import PivotOverview from './pages/PivotOverview';


export default function App() {
    const {user, login, logout, loginAsDemo, authMode} = useAuth();
    const {t} = useTranslation()
    const allowedEmail = import.meta.env.VITE_ALLOWED_EMAIL;
    const isOwner = user?.email === allowedEmail;
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    });

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    useEffect(() => {
        if (user && authMode !== 'demo') {
            logger.info("User detected", user);
            if (!isOwner) {
                logger.warn("Unauthorized user tried to access app", user.email);
            }
        }
    }, [user, isOwner, authMode]);

    return (
        <>
            <div className="container">
                <div className="app-title-row">
                    <h1 className="app-title">
                        {t("title")}
                        <img src="/favicon.svg" alt="Logo" className="app-title-logo"/>
                    </h1>
                </div>
                {authMode === 'demo' && (
                    <div className="demo-mode-banner">
                        <AlertTriangle/>
                        {t('demo_mode_active')}
                        <AlertTriangle/>
                    </div>
                )}
                {user && (isOwner || authMode === 'demo') ? (
                    <>
                        <div className="app-header-row">
                            <h2>{t("greeting", {name: user.displayName})}</h2>
                            <div className="app-header-actions">
                                <LanguageSwitch/>
                                <button className="btn secondary" onClick={logout}>
                                    <LogOut size={18}/>
                                    {t("logout")}
                                </button>
                            </div>
                        </div>
                        <Tabs/>
                        <Routes>
                            <Route path="/" element={<Navigate to="/expenses" replace/>}/>
                            <Route path="/expenses" element={<ExpensesView/>}/>
                            <Route path="/pivot" element={<PivotOverview/>}/>
                        </Routes>
                        <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}/>
                    </>
                ) : user && !isOwner && authMode !== 'demo' ? (
                    <p>{t("access_denied")}</p>
                ) : (
                    <Login onLogin={login} onDemo={loginAsDemo}/>
                )}
            </div>
            <Footer/>
        </>
    );
}
