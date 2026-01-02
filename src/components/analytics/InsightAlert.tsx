import styles from './InsightAlert.module.css';

interface InsightAlertProps {
    title: string;
    children: React.ReactNode;
    type?: 'success' | 'warning' | 'danger' | 'info';
    recommendation?: string;
}

export default function InsightAlert({
    title,
    children,
    type = 'info',
    recommendation
}: InsightAlertProps) {
    return (
        <div className={`${styles.container} ${styles[type]}`}>
            <div className={styles.header}>
                <span className={styles.icon}>
                    {type === 'success' && '✅'}
                    {type === 'warning' && '⚠️'}
                    {type === 'danger' && '🚨'}
                    {type === 'info' && '💡'}
                </span>
                <h4 className={styles.title}>{title}</h4>
            </div>

            <div className={styles.content}>
                {children}
            </div>

            {recommendation && (
                <div className={styles.recommendation}>
                    <strong>Recommendation:</strong> {recommendation}
                </div>
            )}
        </div>
    );
}
