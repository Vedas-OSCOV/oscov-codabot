import Navbar from '@/components/Navbar';
import styles from './leaderboard.module.css';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
    const users = await prisma.user.findMany({
        orderBy: { score: 'desc' },
        take: 50
    });

    return (
        <main className={styles.main}>
            <Navbar />

            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Leaderboard</h1>
                    <p className={styles.subtitle}>The top contributors of the marathon.</p>
                </div>

                <div className={styles.list}>
                    {users.length === 0 ? (
                        <div className={styles.emptyState}>No rankings yet. Start coding!</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: '60px' }}>#</th>
                                    <th>User</th>
                                    <th style={{ textAlign: 'right' }}>Issues Solved</th>
                                    <th style={{ textAlign: 'right' }}>Total Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={user.id} className={index < 3 ? styles.topRow : styles.row}>
                                        <td className={styles.rank}>{index + 1}</td>
                                        <td className={styles.userCell}>
                                            {user.avatar && <img src={user.avatar} className={styles.avatar} alt="" />}
                                            <span className={styles.username}>{user.username}</span>
                                            {index === 0 && <span className={styles.crown}>👑</span>}
                                        </td>
                                        <td style={{ textAlign: 'right', opacity: 0.6 }}>
                                            {/* We would need to count approved submissions here or store it in user model */}
                                            -
                                        </td>
                                        <td className={styles.points}>{user.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </main>
    );
}
