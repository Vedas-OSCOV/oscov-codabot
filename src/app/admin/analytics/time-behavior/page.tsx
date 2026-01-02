import { getTimeBehavior } from '@/lib/analytics';
import AnalyticsCard from '@/components/analytics/AnalyticsCard';
import InsightAlert from '@/components/analytics/InsightAlert';
import { SimpleBarChart } from '@/components/analytics/SimpleBarChart';
import { SimpleTable } from '@/components/analytics/SimpleTable';
import styles from '../analytics.module.css';

export default async function TimeBehaviorPage() {
    const data = await getTimeBehavior();

    const chartData = data.activityOverTime.map(d => ({
        label: d.time.split('T')[1].substring(0, 5), // HH:MM
        value: d.count
    }));

    // Insight Logic
    const totalIntervals = chartData.length;
    let timingVerdict = {
        type: 'info' as 'info' | 'warning' | 'success' | 'danger',
        title: 'Steady Pace',
        msg: 'Activity was distributed evenly.',
        rec: ''
    };

    if (totalIntervals > 4) {
        const lastQuarterIndex = Math.floor(totalIntervals * 0.75);
        const lastQuarterSubs = chartData.slice(lastQuarterIndex).reduce((a, b) => a + b.value, 0);
        const totalSubs = chartData.reduce((a, b) => a + b.value, 0);

        if (lastQuarterSubs / totalSubs > 0.5) {
            timingVerdict = {
                type: 'warning',
                title: 'Panic Mode Detected',
                msg: `Over 50% of submissions happened in the last 25% of the event. Users procrastinated or the duration was too long.`,
                rec: 'Consider shorter, more intense bursts or better reminder notifications mid-event.'
            };
        } else if (chartData.slice(0, Math.ceil(totalIntervals * 0.25)).reduce((a, b) => a + b.value, 0) / totalSubs > 0.5) {
            timingVerdict = {
                type: 'success',
                title: 'Sprinters!',
                msg: `Most activity happened at the very start. Users were eager.`,
                rec: 'Next time, drop problems incrementally to sustain engagement.'
            };
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Time-based Behavior</h1>
                <p className={styles.subtitle}>
                    Was it a sprint or a marathon? Panic detection analysis.
                </p>
            </header>

            <div className={styles.section}>
                <InsightAlert
                    title={timingVerdict.title}
                    type={timingVerdict.type}
                    recommendation={timingVerdict.rec}
                >
                    {timingVerdict.msg}
                </InsightAlert>
            </div>

            <div className={styles.grid}>
                <AnalyticsCard
                    title="Total Submissions Analyzed"
                    value={data.totalSubmissions}
                />
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Submission Activity (Hourly)</h2>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
                    <SimpleBarChart data={chartData} />
                </div>

                <h3 className={styles.sectionTitle} style={{ fontSize: '16px', opacity: 0.8 }}>Hourly Breakdown</h3>
                <SimpleTable
                    headers={['Time Interval', 'Submission Count']}
                    rows={chartData.map(d => [d.label, d.value])}
                />
            </div>
        </div>
    );
}
