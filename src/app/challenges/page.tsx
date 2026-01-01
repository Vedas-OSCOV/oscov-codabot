import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import ChallengeList from "@/components/ChallengeList";

export const dynamic = 'force-dynamic';

export default async function ChallengesPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect('/api/auth/signin');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { semester: true }
    });

    // Fetch all challenges
    const challenges = await prisma.challenge.findMany({
        orderBy: { points: 'desc' }
    });

    // Fetch user submissions to map status
    const submissions = await prisma.submission.findMany({
        where: { userId: session.user.id, challengeId: { not: null } },
        select: { challengeId: true, status: true }
    });

    // Create a plain object map for client component props
    const submissionMap: Record<string, { status: string }> = {};
    submissions.forEach(s => {
        if (s.challengeId) {
            submissionMap[s.challengeId] = { status: s.status };
        }
    });

    const isSenior = (user?.semester || 0) > 1;

    // Filter challenges based on context server-side first (User Tier)
    const filteredChallenges = challenges.filter(c =>
        isSenior ? c.points > 100 : c.points <= 100
    );

    const title = isSenior ? "SENIOR__ARENA" : "FRESHER_GAUNTLET";
    const subtitle = isSenior
        ? "Advanced algorithmic and architectural challenges. Strict code-only validation."
        : "Foundational problems to build your problem-solving intuition. Pseudocode allowed.";

    return (
        <main style={{ minHeight: '100vh', paddingTop: '100px' }}>
            <Navbar />
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>

                <div style={{ marginBottom: '40px' }}>
                    <Link href="/dashboard" style={{ color: '#888', fontSize: '14px', marginBottom: '16px', display: 'inline-block', fontFamily: '"Share Tech Mono"' }}>&lt; DASHBOARD</Link>

                    {(() => {
                        const { getFrenzyStatus } = require('@/lib/frenzy');
                        const frenzy = getFrenzyStatus();
                        if (frenzy.isActive) {
                            return (
                                <div className="retro-window" style={{
                                    marginBottom: '24px',
                                    padding: '16px',
                                    background: 'rgba(220, 38, 38, 0.1)',
                                    border: '2px solid #DC2626',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px'
                                }}>
                                    <div style={{ fontSize: '24px' }}>🔥</div>
                                    <div>
                                        <h3 style={{ margin: '0 0 4px 0', color: '#DC2626', fontFamily: '"Press Start 2P"', fontSize: '12px' }}>FRENZY MODE ACTIVE</h3>
                                        <p style={{ margin: 0, color: '#fff', fontSize: '12px', fontFamily: '"Share Tech Mono"' }}>
                                            2x Points for Seniors • 2-Minute Rate Limits
                                        </p>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })()}
                    <h1 style={{ fontSize: '32px', marginBottom: '16px', color: '#fff', textShadow: '3px 3px #DC2626' }}>
                        {title}
                    </h1>
                    <p style={{ fontSize: '16px', color: '#ccc', maxWidth: '600px', fontFamily: '"Share Tech Mono"' }}>
                        {subtitle}
                    </p>
                </div>

                <ChallengeList
                    initialChallenges={filteredChallenges}
                    submissionMap={submissionMap}
                />

            </div>
        </main>
    );
}
