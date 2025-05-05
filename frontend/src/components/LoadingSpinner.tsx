import {useTranslation} from 'react-i18next'

export function LoadingSpinner() {
    const {t} = useTranslation()

    return (
        <div className="spinner-container" role="status" aria-live="polite">
            <div className="spinner"/>
            <div>{t('loading')}</div>
        </div>
    )
}
