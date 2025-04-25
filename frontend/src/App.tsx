import {Route, Routes} from 'react-router-dom';
import Tabs from './components/Tabs';
import Dashboard from './pages/Dashboard';
import PivotOverview from './pages/PivotOverview.tsx';
import Login from './pages/Login';
import {useAuth} from './hooks/useAuth';
import {LogOut} from 'lucide-react';

export default function App() {
    const {user, login, logout} = useAuth();

    return (
        <div className="container">
            <h1>Wyrmhort</h1>
            {user ? (
                <>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
                        <h2>Hi, {user.displayName}!</h2>
                        <button className="btn secondary" onClick={logout}>
                            <LogOut size={18}/>
                            Logout
                        </button>
                    </div>
                    <Tabs/>
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                        <Route path="/overview" element={<PivotOverview/>}/>
                    </Routes>
                </>
            ) : (
                <Login onLogin={login}/>
            )}
        </div>
    );
}
