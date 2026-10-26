import {useState} from 'react';

import 'flag-icons/css/flag-icons.min.css';
import i18n from '../i18n';

function LanguageFlags({left, right}: {left: 'de' | 'gb'; right: 'de' | 'gb'}) {
    return (
        <span className="language-switch-flags" aria-hidden="true">
            <span className={`fi fi-${left} flag-left`}/>
            <span className={`fi fi-${right} flag-right`}/>
        </span>
    );
}

const getNextLang = (current: string) => (current === 'de' ? 'en' : 'de');

export default function LanguageSwitch() {
    const [lang, setLang] = useState(i18n.language || 'de');

    const handleSwitch = () => {
        const nextLang = getNextLang(lang);
        void i18n.changeLanguage(nextLang);
        setLang(nextLang);
        document.documentElement.lang = nextLang;
    };

    const left = lang === 'de' ? 'de' : 'gb';
    const right = lang === 'de' ? 'gb' : 'de';

    return (
        <button
            onClick={handleSwitch}
            title={lang === 'de' ? 'Switch to English' : 'Wechsel zu Deutsch'}
            className="language-switch-btn"
            aria-label={lang === 'de' ? 'Switch to English' : 'Wechsel zu Deutsch'}
        >
            <LanguageFlags left={left} right={right}/>
        </button>
    );
}
