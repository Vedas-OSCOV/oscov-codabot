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

    if (user?.semester !== 1) {
        return (
            <main style={{ minHeight: '100vh', paddingTop: '100px', textAlign: 'center' }}>
                <Navbar />
                <h1>Access Denied</h1>
                <p>These challenges are only for Semester 1 students.</p>
                <Link href="/dashboard" style={{ color: '#0071e3' }}>Return to Dashboard</Link>
            </main>
        );
    }

    // Fetch challenges
    const challenges = await prisma.challenge.findMany({
        orderBy: { points: 'desc' }
        // Wait, 'point' is 'points' in schema. I need to be careful.
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

    return (
        <main style={{ minHeight: '100vh', paddingTop: '100px', background: '#FAFAFA' }}>
            <Navbar />
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>

                <div style={{ marginBottom: '40px' }}>
                    <Link href="/dashboard" style={{ color: '#666', fontSize: '14px', marginBottom: '16px', display: 'inline-block' }}>← Back to Dashboard</Link>
                    <h1 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '16px', backgroundImage: 'linear-gradient(135deg, #1d1d1f 0%, #434344 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Challenges
                    </h1>
                    <p style={{ fontSize: '18px', color: '#86868b', maxWidth: '600px' }}>
                        Welcome to the gauntlet. These problems are designed to test your theoretical understanding and implementation skills to the limit.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {challenges.map(challenge => {
                        const sub = submissionMap.get(challenge.id);
                        const isSolved = sub?.status === 'APPROVED';
                        const isPending = sub?.status === 'PENDING_AI';

                        return (
                            <Link href={`/challenges/${challenge.id}`} key={challenge.id} className="glass-panel" style={{
                                display: 'block',
                                padding: '24px',
                                transition: 'transform 0.2s',
                                position: 'relative',
                                opacity: isSolved ? 0.8 : 1
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <span style={{
                                        fontSize: '12px', fontWeight: '600', padding: '4px 12px', borderRadius: '99px',
                                        background: 'rgba(0,0,0,0.05)', color: '#666'
                                    }}>
                                        {challenge.points} PTS
                                    </span>
                                    {sub && (
                                        <span style={{
                                            fontSize: '12px', fontWeight: 'bold',
                                            color: isSolved ? '#166534' : isPending ? '#854d0e' : '#991b1b'
                                        }}>
                                            {sub.status}
                                        </span>
                                    )}
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', lineHeight: '1.4' }}>{challenge.title}</h3>
                                <p style={{ fontSize: '14px', color: '#666', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                    {challenge.description}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
