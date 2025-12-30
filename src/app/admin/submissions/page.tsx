import styles from './submissions.module.css';
import { prisma } from '@/lib/db';
import SubmissionActions from '@/components/SubmissionActions';

export const dynamic = 'force-dynamic';

export default async function ReviewSubmissions({
    searchParams
}: {
    searchParams: { userId?: string }
}) {
    const where = searchParams.userId ? { userId: searchParams.userId } : {};

    // Fetch filter context if needed
    let filterUser = null;
    if (searchParams.userId) {
        filterUser = await prisma.user.findUnique({ where: { id: searchParams.userId } });
    }

    const submissions = await prisma.submission.findMany({
        where,
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
                {filterUser ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#e0f2fe', color: '#0369a1', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', border: '1px solid #bae6fd' }}>
                        <span>FILTERING: <strong>{filterUser.name}</strong></span>
                        <a href="/admin/submissions" style={{ marginLeft: 'auto', color: '#0369a1', textDecoration: 'underline' }}>Clear</a>
                    </div>
                ) : (
                    <span className={styles.activeFilter}>All Submissions</span>
                )}
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
                                        <a href={sub.prUrl || undefined} target="_blank" style={{ textDecoration: 'underline' }}>PR Link</a>
                                        <span style={{ color: '#86868b', fontWeight: 'normal' }}> by {sub.user.name || 'Anonymous'}</span>
                                    </h3>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#86868b' }}>
                                        Issue: {sub.issue?.title || 'N/A'}
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

                            {sub.status !== 'APPROVED' && sub.status !== 'REJECTED' && (
                                <SubmissionActions id={sub.id} />
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
