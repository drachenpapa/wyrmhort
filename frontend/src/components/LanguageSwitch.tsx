import {useState} from 'react';

import i18n from '../i18n';

type DiagonalFlagEmojiProps = { left: 'de' | 'en'; right: 'de' | 'en' };

function DiagonalFlagEmoji({left, right}: DiagonalFlagEmojiProps) {
    const EMOJIS = {de: '🇩🇪', en: '🇬🇧'};
    return (
        <span className="diagonal-flag-emoji">
            <span className="flag-left">{EMOJIS[left]}</span>
            <span className="flag-right">{EMOJIS[right]}</span>
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

    const left = lang === 'de' ? 'de' : 'en';
    const right = lang === 'de' ? 'en' : 'de';

    return (
        <button
            onClick={handleSwitch}
            title={lang === 'de' ? 'Switch to English' : 'Wechsel zu Deutsch'}
            className="language-switch-btn"
            aria-label={lang === 'de' ? 'Switch to English' : 'Wechsel zu Deutsch'}
        >
            <DiagonalFlagEmoji left={left} right={right}/>
        </button>
    );
}
