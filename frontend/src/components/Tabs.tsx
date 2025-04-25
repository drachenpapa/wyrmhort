import {NavLink} from 'react-router-dom';
import {BarChart, LayoutDashboard} from 'lucide-react';

export default function Tabs() {
    return (
        <nav className="tabs">
            <NavLink to="/dashboard" className={({isActive}) => isActive ? 'tab active' : 'tab'}>
                <LayoutDashboard className="tab-icon" size={18} />
                Data
            </NavLink>
            <NavLink to="/overview" className={({isActive}) => isActive ? 'tab active' : 'tab'}>
                <BarChart className="tab-icon" size={18} />
                Overview
            </NavLink>
        </nav>
    );
}
