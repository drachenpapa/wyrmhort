import { useTranslation } from 'react-i18next'

export function LoadingSpinner() {
    const { t } = useTranslation()

    return (
        <div className="spinner-container">
            <div className="spinner" />
            <div>{t('loading')}</div>
        </div>
    )
}
