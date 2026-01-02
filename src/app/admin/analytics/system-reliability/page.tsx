import { getSystemReliability } from '@/lib/analytics';
import AnalyticsCard from '@/components/analytics/AnalyticsCard';
import InsightAlert from '@/components/analytics/InsightAlert';
import { SimpleTable } from '@/components/analytics/SimpleTable';
import styles from '../analytics.module.css';

export default async function SystemReliabilityPage() {
    const data = await getSystemReliability();

    // Insight
    const latency = data.avgLatencyMs / 1000; // seconds
    let sysVerdict: {
        type: 'info' | 'warning' | 'danger' | 'success';
        title: string;
        msg: string;
        rec: string;
    } = {
        type: 'success',
        title: 'System Stable',
        msg: 'AI Judge latency is optimal.',
        rec: ''
    };

    if (latency > 15) {
        sysVerdict = {
            type: 'warning',
            title: 'High Latency (>15s)',
            msg: `Average Judge time is ${latency.toFixed(1)}s. Users are waiting too long.`,
            rec: 'Check OpenAI API tier or optimize queue workers.'
        };
    } else if (latency > 45) {
        sysVerdict = {
            type: 'danger',
            title: 'System is Crawling (>45s)',
            msg: `Judge is extremely slow (${latency.toFixed(1)}s). The user experience is degrading.`,
            rec: 'Urgent: Scale pending submission consumers.'
        };
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>System Reliability Autopsy</h1>
                <p className={styles.subtitle}>
                    Is the judge slow? Latency analysis.
                </p>
            </header>

            <div className={styles.section}>
                <InsightAlert
                    title={sysVerdict.title}
                    type={sysVerdict.type}
                    recommendation={sysVerdict.rec}
                >
                    {sysVerdict.msg}
                </InsightAlert>
            </div>

            <div className={styles.grid}>
                <AnalyticsCard
                    title="Avg AI Judge Latency"
                    value={`${(data.avgLatencyMs / 1000).toFixed(2)}s`}
                    trend={data.avgLatencyMs > 10000 ? 'up' : 'down'}
                    trendValue={data.avgLatencyMs > 10000 ? 'Slow' : 'Fast'}
                />
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Metric Logs</h3>
                <SimpleTable
                    headers={['Metric', 'Value', 'Status']}
                    rows={[
                        ['Avg Latency', `${(data.avgLatencyMs / 1000).toFixed(2)}s`, latency > 15 ? 'Warning' : 'OK'],
                        ['Sample Size', '100 recent', '-']
                    ]}
                />
            </div>
        </div>
    );
}
