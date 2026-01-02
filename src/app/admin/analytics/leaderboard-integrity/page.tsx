import { getLeaderboardAudit } from '@/lib/analytics';
import { SimpleTable } from '@/components/analytics/SimpleTable';
import InsightAlert from '@/components/analytics/InsightAlert';
import styles from '../analytics.module.css';

export default async function LeaderboardIntegrityPage() {
    const data = await getLeaderboardAudit();

    // Logic to identify suspicious users from the returned data
    // Assuming data is an array of users with integrity metrics
    const suspiciousUsers = data.filter(u => u.suspicious);

    // Insight Logic
    let cheatVerdict: {
        type: 'info' | 'warning' | 'danger' | 'success';
        title: string;
        msg: string;
        rec: string;
    } = {
        type: 'success',
        title: 'Clean Leaderboard',
        msg: 'No obvious cheating patterns detected.',
        rec: ''
    };

    if (suspiciousUsers.length > 0) {
        cheatVerdict = {
            type: 'danger',
            title: `Suspicious Activity Detected (${suspiciousUsers.length} Users)`,
            msg: `Found ${suspiciousUsers.length} users with suspicious patterns (fast solves or high similarity).`,
            rec: 'Manually review their code. They might have pasted generic solutions.'
        };
    }

    const rows = suspiciousUsers.map(u => [
        u.username,
        u.fastSolves?.toString() || '0',
        u.reason || 'Unknown',
    ]);

    // If data is just a list of all users, we might want to show top users too, 
    // but the prompt asked for integrity audit.
    // Let's assume the table should show suspicious ones.

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Leaderboard Integrity Audit</h1>
                <p className={styles.subtitle}>
                    Who is cheating? Flagging impossible solve times.
                </p>
            </header>

            <div className={styles.section}>
                <InsightAlert
                    title={cheatVerdict.title}
                    type={cheatVerdict.type}
                    recommendation={cheatVerdict.rec}
                >
                    {cheatVerdict.msg}
                </InsightAlert>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Suspicious Users List</h2>
                {rows.length > 0 ? (
                    <SimpleTable
                        headers={['Username', 'Fast Solves count', 'Reason']}
                        rows={rows}
                    />
                ) : (
                    <div style={{ padding: '20px', background: 'rgba(0,255,0,0.1)', borderRadius: '8px' }}>
                        No suspicious users found.
                    </div>
                )}
            </div>
        </div>
    );
}
