import { getFunnelMetrics } from '@/lib/analytics';
import AnalyticsCard from '@/components/analytics/AnalyticsCard';
import InsightAlert from '@/components/analytics/InsightAlert';
import { SimpleBarChart } from '@/components/analytics/SimpleBarChart';
import { SimpleTable } from '@/components/analytics/SimpleTable';
import styles from '../analytics.module.css';

export default async function FunnelAutopsyPage() {
    const data = await getFunnelMetrics();

    const chartData = [
        { label: 'Registered', value: data.registered },
        { label: 'Submitted 1+', value: data.submittedOne },
        { label: 'First AC', value: data.gotFirstAC },
        { label: 'Solved 2+', value: data.solvedTwo },
        { label: 'Solved 50%+', value: data.solvedHalf },
    ];

    const dropOffRegisteredToAC = data.registered > 0 ? ((data.registered - data.gotFirstAC) / data.registered * 100).toFixed(1) : 0;

    // Insight Logic
    let funnelVerdict: {
        type: 'info' | 'warning' | 'danger' | 'success';
        title: string;
        msg: string;
        rec: string;
    } = {
        type: 'info',
        title: 'Smooth Funnel',
        msg: 'Users are progressing reasonably well.',
        rec: ''
    };

    const registrationDrop = data.registered > 0 ? (data.registered - data.submittedOne) / data.registered : 0;
    const acDrop = data.submittedOne > 0 ? (data.submittedOne - data.gotFirstAC) / data.submittedOne : 0;

    if (registrationDrop > 0.6) {
        funnelVerdict = {
            type: 'danger',
            title: 'Onboarding is Broken',
            msg: `${(registrationDrop * 100).toFixed(0)}% of users registered but NEVER submitted anything.`,
            rec: 'Simplify the signup-to-code flow. Reduce setup steps.'
        };
    } else if (acDrop > 0.5) {
        funnelVerdict = {
            type: 'warning',
            title: 'First Problem Block',
            msg: `High churn between first submission and first AC. The first problem is likely too hard or instructions are unclear.`,
            rec: 'Audit the easiest problem. Ensure test cases are fair.'
        };
    } else {
        funnelVerdict = {
            type: 'success',
            title: 'Healthy Conversion',
            msg: 'Most users who start, get at least one AC. Good job.',
            rec: 'Focus on depth now (getting them to solve 5+).'
        };
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Funnel Autopsy</h1>
                <p className={styles.subtitle}>
                    Where did users die? Analyzing the full conversion funnel.
                </p>
            </header>

            <div className={styles.section}>
                <InsightAlert
                    title={funnelVerdict.title}
                    type={funnelVerdict.type}
                    recommendation={funnelVerdict.rec}
                >
                    {funnelVerdict.msg}
                </InsightAlert>
            </div>

            <div className={styles.grid}>
                <AnalyticsCard
                    title="Registration Drop-off"
                    value={`${dropOffRegisteredToAC}%`}
                    trend="down"
                    trendValue="Lost before first AC"
                />
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Conversion Funnel</h2>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
                    <SimpleBarChart data={chartData} color="#10B981" />
                </div>

                <h3 className={styles.sectionTitle} style={{ fontSize: '16px', opacity: 0.8 }}>Stage Data</h3>
                <SimpleTable
                    headers={['Funnel Stage', 'User Count']}
                    rows={chartData.map(d => [d.label, d.value])}
                />
            </div>
        </div>
    );
}
