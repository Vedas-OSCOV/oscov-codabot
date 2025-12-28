import styles from './issues.module.css';
import Navbar from '@/components/Navbar';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function IssuesPage() {
    const issues = await prisma.issue.findMany({
        where: { status: 'OPEN' },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <main className={styles.main}>
            <Navbar />

            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Open Issues</h1>
                    <p className={styles.subtitle}>Select an issue, solve it, and earn points.</p>
                </div>

                <div className={styles.grid}>
                    {issues.length === 0 ? (
                        <div className={styles.empty}>No active issues at the moment. Check back later!</div>
                    ) : (
                        issues.map((issue) => (
                            <div key={issue.id} className={`${styles.card} glass-panel`}>
                                <div className={styles.cardHeader}>
                                    <span className={styles.repoName}>{issue.repoUrl.split('github.com/')[1]}</span>
                                    <span className={styles.points}>{issue.basePoints} pts</span>
                                </div>
                                <h3 className={styles.cardTitle}>
                                    <a href={issue.repoUrl + '/issues/' + issue.issueNumber} target="_blank" className={styles.link}>
                                        #{issue.issueNumber} {issue.title}
                                    </a>
                                </h3>
                                <p className={styles.desc}>{issue.description.substring(0, 120)}...</p>
                                <div className={styles.actions}>
                                    <Link href={`/issues/${issue.id}/submit`} className={styles.submitBtn}>
                                        Submit Solution
                                    </Link>
                                    <a href={issue.repoUrl + '/issues/' + issue.issueNumber} target="_blank" className={styles.viewBtn}>
                                        View on GitHub ↗
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
