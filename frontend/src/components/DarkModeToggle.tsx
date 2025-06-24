import {Moon, Sun} from 'lucide-react';
import {useEffect} from 'react';

interface DarkModeToggleProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

export default function DarkModeToggle({isDarkMode, toggleDarkMode}: DarkModeToggleProps) {
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <div className="dark-mode-toggle">
            <button onClick={toggleDarkMode} className="dark-mode-icon-btn">
                {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
        </div>
    );
}
