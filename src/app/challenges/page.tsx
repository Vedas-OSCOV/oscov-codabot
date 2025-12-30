import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

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

    // Access Check Removed: Challenges are now open for all semesters.


    // Fetch challenges
    const challenges = await prisma.challenge.findMany({
        orderBy: { points: 'desc' }
    });

    // Fetch user submissions to map status
    const submissions = await prisma.submission.findMany({
        where: { userId: session.user.id, challengeId: { not: null } },
        select: { challengeId: true, status: true, awardedPoints: true }
    });

    const submissionMap = new Map();
    submissions.forEach(s => {
        if (s.challengeId) submissionMap.set(s.challengeId, s);
    });

    const isSenior = (user?.semester || 0) > 1;

    // Filter challenges based on context
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
                    <h1 style={{ fontSize: '32px', marginBottom: '16px', color: '#fff', textShadow: '3px 3px #DC2626' }}>
                        {title}
                    </h1>
                    <p style={{ fontSize: '16px', color: '#ccc', maxWidth: '600px', fontFamily: '"Share Tech Mono"' }}>
                        {subtitle}
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {filteredChallenges.length > 0 ? filteredChallenges.map(challenge => {
                        const sub = submissionMap.get(challenge.id);
                        const isSolved = sub?.status === 'APPROVED';
                        const isPending = sub?.status === 'PENDING_AI';

                        return (
                            <Link href={`/challenges/${challenge.id}`} key={challenge.id} className="retro-window" style={{
                                display: 'block',
                                padding: '24px',
                                transition: 'transform 0.1s',
                                position: 'relative',
                                opacity: isSolved ? 0.6 : 1,
                                textDecoration: 'none'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <span style={{
                                        fontSize: '10px', padding: '4px 8px',
                                        background: '#fff', color: '#000', fontFamily: '"Press Start 2P"'
                                    }}>
                                        {challenge.points} PTS
                                    </span>
                                    {sub && (
                                        <span style={{
                                            fontSize: '10px',
                                            color: isSolved ? '#0f0' : isPending ? '#fbbf24' : '#DC2626',
                                            fontFamily: '"Share Tech Mono"'
                                        }}>
                                            [{sub.status}]
                                        </span>
                                    )}
                                </div>
                                <h3 style={{ fontSize: '16px', marginBottom: '12px', lineHeight: '1.4', color: '#fff', textTransform: 'uppercase' }}>{challenge.title}</h3>
                                <p style={{ fontSize: '14px', color: '#888', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', fontFamily: '"Share Tech Mono"' }}>
                                    {challenge.description}
                                </p>
                            </Link>
                        );
                    }) : (
                        <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#666' }}>
                            <h3>NO_DATA_FOUND.</h3>
                            <p>CHECK_BACK_LATER.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
