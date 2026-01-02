import { getProblemStats } from '@/lib/analytics';
import { SimpleTable } from '@/components/analytics/SimpleTable';
import InsightAlert from '@/components/analytics/InsightAlert';
import styles from '../analytics.module.css';

export default async function ProblemPostMortemPage() {
    const data = await getProblemStats();

    // Sort by solve rate ascending (hardest first)
    const sortedData = [...data].sort((a, b) => a.solveRate - b.solveRate);

    // Insight: Find the "Killer" problem
    const killerProblem = sortedData.find(p => p.solveRate < 10 && p.attempts > 5);
    let problemVerdict: {
        type: 'info' | 'warning' | 'danger' | 'success';
        title: string;
        msg: string;
        rec: string;
    } = {
        type: 'success',
        title: 'Balanced Set',
        msg: 'No problems seem broken.',
        rec: ''
    };

    if (killerProblem) {
        problemVerdict = {
            type: 'danger',
            title: `Problem Killer: "${killerProblem.title}"`,
            msg: `This problem has a ${killerProblem.solveRate.toFixed(1)}% solve rate despite attempts. It might be broken or impossibly hard.`,
            rec: 'Review test cases for edge case failures or ambiguous description.'
        };
    }

    const rows = sortedData.map(p => [
        p.title,
        p.points,
        p.attempts,
        p.uniqueUsers,
        `${p.solveRate.toFixed(1)}%`,
        // Difficulty Lie Score (placeholder logic)
        (p.solveRate < 20 && p.points < 100) ? 'High Lie' : 'Normal'
    ]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Problem Set Post-Mortem</h1>
                <p className={styles.subtitle}>
                    Brutal honesty about the problem set. Which problems killed the vibe?
                </p>
            </header>

            <div className={styles.section}>
                <InsightAlert
                    title={problemVerdict.title}
                    type={problemVerdict.type as any}
                    recommendation={problemVerdict.rec}
                >
                    {problemVerdict.msg}
                </InsightAlert>
            </div>

            <div className={styles.section}>
                <SimpleTable
                    headers={['Problem', 'Points', 'Attempts', 'Unique Users', 'Solve Rate', 'Difficulty Lie']}
                    rows={rows}
                />
            </div>
        </div>
    );
}
