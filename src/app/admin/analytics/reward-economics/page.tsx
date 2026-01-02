import { getRewardStats } from '@/lib/analytics';
import AnalyticsCard from '@/components/analytics/AnalyticsCard';
import InsightAlert from '@/components/analytics/InsightAlert';
import { SimpleTable } from '@/components/analytics/SimpleTable';
import styles from '../analytics.module.css';

export default async function RewardEconomicsPage() {
    const data = await getRewardStats();

    // Insight
    const inequality = data.top5PercentShare;
    let econVerdict: {
        type: 'info' | 'warning' | 'danger' | 'success';
        title: string;
        msg: string;
        rec: string;
    } = {
        type: 'success',
        title: 'Healthy Distribution',
        msg: 'Points are spread reasonably well.',
        rec: ''
    };

    if (inequality > 50) {
        econVerdict = {
            type: 'warning',
            title: 'High Inequality',
            msg: `Top 5% of users hold ${inequality.toFixed(1)}% of all points. The rich are getting richer.`,
            rec: 'Consider diminishing returns for top performers to keep others motivated.'
        };
    } else if (inequality > 70) {
        econVerdict = {
            type: 'danger',
            title: 'Oligarchy Detected',
            msg: `Top 5% hold ${inequality.toFixed(1)}% of the wealth. Most users have almost zero points compared to them.`,
            rec: 'Urgent: Flatten the point curve or add catch-up mechanics.'
        };
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Reward Economics</h1>
                <p className={styles.subtitle}>
                    Gini coefficient and point distribution. Is it fair?
                </p>
            </header>

            <div className={styles.section}>
                <InsightAlert
                    title={econVerdict.title}
                    type={econVerdict.type}
                    recommendation={econVerdict.rec}
                >
                    {econVerdict.msg}
                </InsightAlert>
            </div>

            <div className={styles.grid}>
                <AnalyticsCard
                    title="Total Points Minted"
                    value={data.totalScore.toLocaleString()}
                />
                <AnalyticsCard
                    title="Top 5% Wealth Share"
                    value={`${data.top5PercentShare.toFixed(1)}%`}
                    trend={data.top5PercentShare > 50 ? 'up' : 'down'}
                    trendValue={data.top5PercentShare > 50 ? 'Inequal' : 'Fair'}
                />
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Distribution Breakdown</h3>
                <SimpleTable
                    headers={['Segment', 'Points Share', 'Verdict']}
                    rows={[
                        ['Top 5% Users', `${data.top5PercentShare.toFixed(1)}%`, data.top5PercentShare > 50 ? 'Hoarding' : 'OK'],
                        ['Bottom 95% Users', `${(100 - data.top5PercentShare).toFixed(1)}%`, 'Result of long tail']
                    ]}
                />
            </div>
        </div>
    );
}
