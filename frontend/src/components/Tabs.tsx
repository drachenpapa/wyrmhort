import {BarChart, LayoutDashboard} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {NavLink} from 'react-router-dom';

export default function Tabs() {
    const {t} = useTranslation();
    const tabs = [
        {path: "/expenses", label: t("expenses"), layout: LayoutDashboard},
        {path: "/overview", label: t("pivot"), layout: BarChart},
    ];

    return (
        <nav className="tabs" role="tablist">
            {tabs.map(({path, label, layout: LayoutIcon}) => (
                <NavLink key={path} to={path} className={({isActive}) => isActive ? 'tab active' : 'tab'} role="tab">
                    <LayoutIcon className="tab-icon" size={18}/>
                    {label}
                </NavLink>
            ))}
        </nav>
    );
}
