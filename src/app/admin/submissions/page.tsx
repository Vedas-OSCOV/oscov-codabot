import styles from './submissions.module.css';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ReviewSubmissions() {
    const submissions = await prisma.submission.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: true,
            issue: true
        }
    });

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Review Submissions</h1>

            <div className={styles.filterBar}>
                <span className={styles.activeFilter}>All</span>
            </div>

            <div className={styles.list}>
                {submissions.length === 0 ? (
                    <div className={styles.emptyState}>
                        All caught up! No submissions pending.
                    </div>
                ) : (
                    submissions.map(sub => (
                        <div key={sub.id} className="glass-panel" style={{ padding: '24px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                                        <a href={sub.prUrl} target="_blank" style={{ textDecoration: 'underline' }}>PR Link</a>
                                        <span style={{ color: '#86868b', fontWeight: 'normal' }}> by {sub.user.username}</span>
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#86868b' }}>
                                        Issue: {sub.issue.title}
                                    </p>
                                </div>
                                <div className={styles.statusBadge} data-status={sub.status}>
                                    {sub.status}
                                </div>
                            </div>

                            <div style={{ background: 'rgba(0,0,0,0.03)', padding: '16px', borderRadius: '12px', fontSize: '14px' }}>
                                <strong style={{ display: 'block', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', color: '#666' }}>AI Analysis</strong>
                                {sub.aiFeedback || "No feedback generated."}
                                <div style={{ marginTop: '8px', fontWeight: '600', color: sub.aiScore && sub.aiScore > 70 ? 'green' : 'orange' }}>
                                    Quality Score: {sub.aiScore}/100
                                </div>
                            </div>

                            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                                <button className="button-primary" style={{ fontSize: '13px', padding: '8px 16px', backgroundColor: 'green' }}>Approve</button>
                                <button className="button-primary" style={{ fontSize: '13px', padding: '8px 16px', backgroundColor: 'red' }}>Reject</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
