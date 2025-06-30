import {Trans} from 'react-i18next';

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="app-footer">
            <p>
                <Trans
                    i18nKey="footer_text"
                    values={{year}}
                    components={{
                        project: (
                            <a
                                href="https://github.com/drachenpapa/wyrmhort"
                                target="_blank"
                                rel="noopener noreferrer"
                            />
                        ),
                        author: (
                            <a
                                href="https://github.com/drachenpapa"
                                target="_blank"
                                rel="noopener noreferrer"
                            />
                        ),
                    }}
                />
            </p>
        </footer>
    );
}
