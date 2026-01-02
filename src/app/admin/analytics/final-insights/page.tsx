import { getFinalInsights } from '@/lib/analytics';
import styles from '../analytics.module.css';

export default async function FinalInsightsPage() {
    const insights = await getFinalInsights();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Final "What to Fix" Panel</h1>
                <p className={styles.subtitle}>
                    Auto-generated insights for your next event. Verify these verdicts.
                </p>
            </header>

            <div className={styles.section}>
                {insights.length === 0 ? (
                    <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        No critical alerts detected yet. You ran a smooth event!
                    </div>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {insights.map((insight, i) => (
                            <li key={i} style={{
                                padding: '24px',
                                background: 'rgba(220, 38, 38, 0.1)',
                                borderLeft: '4px solid #DC2626',
                                marginBottom: '16px',
                                borderRadius: '0 8px 8px 0',
                                color: '#fff',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '15px'
                            }}>
                                ⚠️ {insight}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
