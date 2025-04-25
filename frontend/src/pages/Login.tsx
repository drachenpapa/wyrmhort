import {LogIn} from 'lucide-react';

type Props = {
    onLogin: () => void;
};

export default function Login({onLogin}: Props) {
    return (
        <div style={{textAlign: 'center', marginTop: '5rem'}}>
            <button className="btn primary" onClick={onLogin}>
                <LogIn size={18}/>
                Login mit Google
            </button>
        </div>
    );
}
