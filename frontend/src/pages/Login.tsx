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
            <p className="login-info">
                {t("login_about")}
                <br/><br/>
                <b>{t("login_note")}:</b> {t("login_info")}
            </p>
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
