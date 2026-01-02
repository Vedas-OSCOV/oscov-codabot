import { getRetentionStats } from '@/lib/analytics';
import AnalyticsCard from '@/components/analytics/AnalyticsCard';
import InsightAlert from '@/components/analytics/InsightAlert';
import { SimpleTable } from '@/components/analytics/SimpleTable';
import styles from '../analytics.module.css';

export default async function RetentionPage() {
    const data = await getRetentionStats();

    // Insight
    const churnRate = data.oneAndDone / (data.oneAndDone + data.powerUsers + 1); // rough approx
    let retentionVerdict: {
        type: 'info' | 'warning' | 'danger' | 'success';
        title: string;
        msg: string;
        rec: string;
    } = {
        type: 'success',
        title: 'High Retention',
        msg: 'Users are sticking around.',
        rec: ''
    };

    if (data.oneAndDone > data.powerUsers) {
        retentionVerdict = {
            type: 'warning',
            title: 'High Churn (One-and-Done)',
            msg: `${data.oneAndDone} users left after 1 problem. Only ${data.powerUsers} became power users.`,
            rec: 'Review the difficulty jump after the first problem.'
        };
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Retention & Engagement</h1>
                <p className={styles.subtitle}>
                    Are they staying or leaving?
                </p>
            </header>

            <div className={styles.section}>
                <InsightAlert
                    title={retentionVerdict.title}
                    type={retentionVerdict.type}
                    recommendation={retentionVerdict.rec}
                >
                    {retentionVerdict.msg}
                </InsightAlert>
            </div>

            <div className={styles.grid}>
                <AnalyticsCard
                    title="One-and-Done Users"
                    value={data.oneAndDone}
                    trend="up" // High is bad usually
                    trendValue=" churn risk"
                    description="Solved exactly 1 problem then quit."
                />
                <AnalyticsCard
                    title="Power Users"
                    value={data.powerUsers}
                    trend="up"
                    trendValue=" loyal"
                    description="Solved 5+ problems."
                />
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>User Segmentation</h3>
                <SimpleTable
                    headers={['Segment', 'Count', 'Description']}
                    rows={[
                        ['One-and-Done', data.oneAndDone, 'Solved exactly 1 problem'],
                        ['Power Users', data.powerUsers, 'Solved 5+ problems'],
                        ['Casuals', data.totalUsers - data.oneAndDone - data.powerUsers, 'Solved 2-4 problems (Derived)']
                    ]}
                />
            </div>
        </div>
    );
}
