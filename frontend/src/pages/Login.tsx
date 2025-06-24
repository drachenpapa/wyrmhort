import {LogIn, UserCheck} from "lucide-react";
import {useTranslation} from 'react-i18next';

type Props = {
    onLogin: () => void;
    onDemo: () => void;
};

export default function Login({onLogin, onDemo}: Props) {
    const {t} = useTranslation();

    return (
        <div className="login-form">
            <button className="btn primary" onClick={onLogin}>
                <LogIn size={18}/>
                {t("login_with_google")}
            </button>
            <button className="btn primary" onClick={onDemo}>
                <UserCheck size={18}/>
                {t("login_as_demo")}
            </button>
        </div>
    );
}
