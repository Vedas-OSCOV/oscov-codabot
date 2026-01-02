import { getDifficultyCurve } from '@/lib/analytics';
import { SimpleBarChart } from '@/components/analytics/SimpleBarChart';
import { SimpleTable } from '@/components/analytics/SimpleTable';
import InsightAlert from '@/components/analytics/InsightAlert';
import styles from '../analytics.module.css';

export default async function DifficultyCurvePage() {
    const data = await getDifficultyCurve();

    // Sort by bucket (problems solved count)
    const sortedData = data.sort((a, b) => a.bucket - b.bucket);
    const chartData = sortedData.map(d => ({
        label: `${d.bucket} Solved`,
        value: d.users
    }));

    // Insight: Find "The Wall" (bucket with most users, excluding 0/1 if they are dropouts)
    let maxUsers = 0;
    let wallBucket = 0;
    sortedData.forEach(d => {
        if (d.users > maxUsers) {
            maxUsers = d.users;
            wallBucket = d.bucket;
        }
    });

    let wallVerdict: {
        type: 'info' | 'warning' | 'danger' | 'success';
        title: string;
        msg: string;
        rec: string;
    } = {
        type: 'info',
        title: 'Analysis Pending',
        msg: 'Not enough data.',
        rec: ''
    };
    if (wallBucket <= 2) {
        wallVerdict = {
            type: 'warning',
            title: 'The Wall is Early',
            msg: `Most users stopped after solving only ${wallBucket} problems. Using early problems as a filter was too effective.`,
            rec: 'The transition from Easy to Medium problems is too steep.'
        };
    } else {
        wallVerdict = {
            type: 'success',
            title: 'Good Progression',
            msg: `Most users reached ${wallBucket} problems. The curve is sustainable.`,
            rec: ''
        };
    }

    // Drill down data for table
    const tableHeaders = ['Problems Solved', 'User Count', '% of Total Users'];
    const totalUsers = data.reduce((acc, curr) => acc + curr.users, 0);
    const tableRows = sortedData.map(d => [
        d.bucket,
        d.users,
        totalUsers > 0 ? `${((d.users / totalUsers) * 100).toFixed(1)}%` : '0%'
    ]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Difficulty Curve Analysis</h1>
                <p className={styles.subtitle}>
                    Cumulative solve curve. Where did the majority hit the wall?
                </p>
            </header>

            <div className={styles.section}>
                <InsightAlert
                    title={wallVerdict.title}
                    type={wallVerdict.type}
                    recommendation={wallVerdict.rec}
                >
                    {wallVerdict.msg}
                </InsightAlert>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Users vs Problems Solved Count</h2>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
                    <SimpleBarChart data={chartData} color="#F59E0B" />
                </div>

                <h3 className={styles.sectionTitle} style={{ fontSize: '16px', opacity: 0.8 }}>Detailed Breakdown</h3>
                <SimpleTable headers={tableHeaders} rows={tableRows} />
            </div>
        </div>
    );
}
