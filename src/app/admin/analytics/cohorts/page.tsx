import { getCohortStats } from '@/lib/analytics';
import AnalyticsCard from '@/components/analytics/AnalyticsCard';
import InsightAlert from '@/components/analytics/InsightAlert';
import { SimpleTable } from '@/components/analytics/SimpleTable';
import { SimpleBarChart } from '@/components/analytics/SimpleBarChart';
import styles from '../analytics.module.css';

export default async function CohortComparisonsPage() {
    const data = await getCohortStats();

    // Insight
    let cohortVerdict: {
        type: 'info' | 'warning' | 'danger' | 'success';
        title: string;
        msg: string;
        rec: string;
    } = {
        type: 'info',
        title: 'Balanced Performance',
        msg: 'Juniors and Seniors are performing similarly.',
        rec: ''
    };

    if (data.freshers.avgScore > data.seniors.avgScore) {
        cohortVerdict = {
            type: 'success',
            title: 'Juniors are Crushing It!',
            msg: `Freshers (Sem 1) have higher avg score (${data.freshers.avgScore.toFixed(0)}) than Seniors (${data.seniors.avgScore.toFixed(0)}).`,
            rec: 'Invest in this talented fresher batch.'
        };
    } else if (data.seniors.avgScore > data.freshers.avgScore * 2) {
        cohortVerdict = {
            type: 'warning',
            title: 'Huge Skill Gap',
            msg: `Seniors are scoring 2x more than freshers. The problem set might be too advanced for beginners.`,
            rec: 'Add separate tracks for different levels next time.'
        };
    }

    const chartData = [
        { label: 'Freshers Avg Score', value: data.freshers.avgScore },
        { label: 'Seniors Avg Score', value: data.seniors.avgScore }
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Cohort Comparisons</h1>
                <p className={styles.subtitle}>
                    Freshers vs Seniors. Who performed better?
                </p>
            </header>

            <div className={styles.section}>
                <InsightAlert
                    title={cohortVerdict.title}
                    type={cohortVerdict.type}
                    recommendation={cohortVerdict.rec}
                >
                    {cohortVerdict.msg}
                </InsightAlert>
            </div>

            <div className={styles.gridTwo}>
                <AnalyticsCard
                    title="Freshers Count"
                    value={data.freshers.count}
                />
                <AnalyticsCard
                    title="Seniors Count"
                    value={data.seniors.count}
                />
            </div>

            <div className={styles.gridTwo}>
                <div className={styles.chartWrapper}>
                    <h3 className={styles.sectionTitle}>Average Score Comparison</h3>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px' }}>
                        <SimpleBarChart data={chartData} color="#3B82F6" />
                    </div>
                </div>

                <div>
                    <h3 className={styles.sectionTitle}>Detailed Stats</h3>
                    <SimpleTable
                        headers={['Cohort', 'Count', 'Avg Score']}
                        rows={[
                            ['Freshers (Sem 1)', data.freshers.count, data.freshers.avgScore.toFixed(0)],
                            ['Seniors (Sem >1)', data.seniors.count, data.seniors.avgScore.toFixed(0)]
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}
