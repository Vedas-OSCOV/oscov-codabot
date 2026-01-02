import styles from './AnalyticsCard.module.css';

interface AnalyticsCardProps {
    title: string;
    value?: string | number;
    subtitle?: string;
    description?: string;
    children?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    className?: string;
}

export default function AnalyticsCard({
    title,
    value,
    subtitle,
    description,
    children,
    trend,
    trendValue,
    className
}: AnalyticsCardProps) {
    return (
        <div className={`${styles.card} ${className || ''}`}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                {description && <div className={styles.info} title={description}>ℹ️</div>}
            </div>

            <div className={styles.body}>
                {value !== undefined && (
                    <div className={styles.metric}>
                        <div className={styles.value}>{value}</div>
                        {trend && (
                            <div className={`${styles.trend} ${styles[trend]}`}>
                                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
                            </div>
                        )}
                    </div>
                )}

                {subtitle && <div className={styles.subtitle}>{subtitle}</div>}

                {children && <div className={styles.content}>{children}</div>}
            </div>
        </div>
    );
}
