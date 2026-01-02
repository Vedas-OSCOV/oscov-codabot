import { getLanguageStats } from '@/lib/analytics';
import { SimpleBarChart } from '@/components/analytics/SimpleBarChart';
import { SimpleTable } from '@/components/analytics/SimpleTable';
import InsightAlert from '@/components/analytics/InsightAlert';
import styles from '../analytics.module.css';

export default async function LanguageInsightsPage() {
    const data = await getLanguageStats();

    // Sort by count
    const sortedData = data.distribution.sort((a, b) => b.count - a.count);

    const chartData = sortedData.map(d => ({
        label: d.language,
        value: d.count
    }));

    // Insight
    const topLang = sortedData[0];
    let langVerdict: {
        type: 'info' | 'warning' | 'danger' | 'success';
        title: string;
        msg: string;
        rec: string;
    } = {
        type: 'info',
        title: 'Diverse Stack',
        msg: 'No single language dominates completely.',
        rec: ''
    };

    if (topLang && topLang.language === 'Python') {
        langVerdict = {
            type: 'info',
            title: 'Python Dominance',
            msg: `Python is the top choice (${topLang.count} submissions). Expected for DSA.`,
            rec: 'Ensure Python time limits are strict enough compared to C++.'
        };
    } else if (topLang && topLang.language === 'C++') {
        langVerdict = {
            type: 'info',
            title: 'Competitive Coders Detected',
            msg: `C++ is dominant. You have a lot of competitive programmers.`,
            rec: ''
        };
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Language & Stack Insights</h1>
                <p className={styles.subtitle}>
                    Python vs C++ vs JS. What are they using?
                </p>
            </header>

            <div className={styles.section}>
                <InsightAlert
                    title={langVerdict.title}
                    type={langVerdict.type}
                    recommendation={langVerdict.rec}
                >
                    {langVerdict.msg}
                </InsightAlert>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Language Distribution</h2>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
                    <SimpleBarChart data={chartData} color="#8B5CF6" />
                </div>

                <h3 className={styles.sectionTitle} style={{ fontSize: '16px', opacity: 0.8 }}>Usage Breakdown</h3>
                <SimpleTable
                    headers={['Language', 'Submissions Count', 'Market Share']}
                    rows={sortedData.map(d => [d.language, d.count, `${((d.count / (data.total || 1)) * 100).toFixed(1)}%`])}
                />
            </div>
        </div>
    );
}
