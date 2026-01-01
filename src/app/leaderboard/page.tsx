import Navbar from '@/components/Navbar';
import styles from './leaderboard.module.css';
import { prisma } from '@/lib/db';
import LeaderboardTabs from '@/components/LeaderboardTabs';
import CountdownTimer from "@/components/CountdownTimer";
import { GAME_OVER_TIMESTAMP } from "@/lib/game-config";

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
    const regularUsers = await prisma.user.findMany({
        where: { OR: [{ semester: { not: 1 } }, { semester: null }] }, // Semester 2-8 or unknown
        orderBy: { score: 'desc' },
        take: 50
    });

    const semester1Users = await prisma.user.findMany({
        where: { semester: 1 },
        orderBy: { score: 'desc' },
        take: 50
    });

    return (
        <main className={styles.main}>
            <Navbar />

            <div className={styles.container}>
                <CountdownTimer targetDate={GAME_OVER_TIMESTAMP} />

                <div className={styles.header}>
                    <h1 className={styles.title}>Leaderboard</h1>
                    <p className={styles.subtitle}>Top contributors across all tracks.</p>
                </div>

                <LeaderboardTabs
                    regularUsers={regularUsers}
                    semester1Users={semester1Users}
                    styles={styles}
                />
            </div>
        </main>
    );
}
