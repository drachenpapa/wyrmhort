import {LogIn} from 'lucide-react';
import {useTranslation} from 'react-i18next';

type Props = {
    onLogin: () => void;
};

export default function Login({onLogin}: Props) {
    const {t} = useTranslation();

    return (
        <div style={{textAlign: 'center', marginTop: '5rem'}}>
            <button className="btn primary" onClick={onLogin}>
                <LogIn size={18}/>
                {t('login')}
            </button>
        </div>
    );
}
