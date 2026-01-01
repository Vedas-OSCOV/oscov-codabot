import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import CountdownTimer from "@/components/CountdownTimer";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect('/api/auth/signin');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            submissions: {
                include: {
                    issue: true,
                    challenge: true
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });




    if (!user) return <div>User not found</div>;

    // Onboarding Check
    if (!user.semester) {
        redirect('/onboarding');
    }

    const isFirstSemester = user.semester === 1;

    return (
        <main style={{ minHeight: '100vh', paddingTop: '100px' }}>
            <Navbar />
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
                <CountdownTimer targetDate="2026-01-02T11:00:00+05:45" />

                {(() => {
                    const { getFrenzyStatus } = require('@/lib/frenzy');
                    const frenzy = getFrenzyStatus();
                    return (
                        <div className="retro-window" style={{
                            marginBottom: '24px',
                            padding: '16px',
                            background: frenzy.isActive ? 'rgba(220, 38, 38, 0.1)' : 'rgba(0, 0, 0, 0.3)',
                            border: frenzy.isActive ? '2px solid #DC2626' : '1px solid #333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                        }}>
                            <div style={{ fontSize: '24px' }}>{frenzy.isActive ? '🔥' : '⏳'}</div>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', color: frenzy.isActive ? '#DC2626' : '#888', fontFamily: '"Press Start 2P"', fontSize: '10px' }}>
                                    {frenzy.isActive ? 'FRENZY_MODE_ACTIVE' : 'FRENZY_MODE_SCHEDULE'}
                                </h3>
                                <p style={{ margin: 0, color: '#ccc', fontSize: '12px', fontFamily: '"Share Tech Mono"' }}>
                                    {frenzy.message}
                                </p>
                            </div>
                            <div style={{ marginLeft: 'auto', color: '#666', fontFamily: '"Share Tech Mono"', fontSize: '12px' }}>
                                {frenzy.nepalTime} NPT
                            </div>
                        </div>
                    );
                })()}

                <div className="retro-window" style={{ marginBottom: '40px', padding: '32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                    {user.image && <img src={user.image} style={{ width: 80, height: 80, border: '4px solid #fff', imageRendering: 'pixelated' }} />}
                    <div>
                        <h1 style={{ fontSize: '24px', margin: 0, color: '#fff', textShadow: '2px 2px #DC2626', fontFamily: '"Press Start 2P"' }}>{user.name}</h1>
                        <p style={{ color: '#0f0', marginTop: '12px', fontFamily: '"Share Tech Mono"', fontSize: '14px' }}>
                            {isFirstSemester ? '[FRESHER_TRACK]' : `[SEMESTER_${user.semester}]`}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                    <div className="retro-window" style={{ padding: '24px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '12px', color: '#888', marginBottom: '16px', fontFamily: '"Press Start 2P"' }}>SCORE</h3>
                        <div style={{ fontSize: '48px', color: '#fff', textShadow: '3px 3px #DC2626', fontFamily: '"Press Start 2P"' }}>{user.score}</div>
                    </div>
                    <div className="retro-window" style={{ padding: '24px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '12px', color: '#888', marginBottom: '16px', fontFamily: '"Press Start 2P"' }}>
                            {isFirstSemester ? 'SOLVED' : 'TOTAL'}
                        </h3>
                        <div style={{ fontSize: '48px', color: '#fff', textShadow: '3px 3px #DC2626', fontFamily: '"Press Start 2P"' }}>{user.submissions.length}</div>
                    </div>
                </div>

                {isFirstSemester ? (
                    <div className="retro-window" style={{ marginBottom: '40px', padding: '32px', textAlign: 'center', background: '#000' }}>
                        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#0f0', fontFamily: '"Press Start 2P"' }}>FRESHER_GAUNTLET</h2>
                        <p style={{ fontSize: '14px', color: '#ccc', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px', fontFamily: '"Share Tech Mono"' }}>
                            Prove your worth. Solve DSA challenges to earn your rank.
                        </p>
                        <a href="/challenges" style={{
                            display: 'inline-block',
                            padding: '12px 32px',
                            color: '#000',
                            background: '#0f0',
                            fontWeight: '600',
                            textDecoration: 'none',
                            fontFamily: '"Press Start 2P"',
                            fontSize: '12px',
                            border: '2px solid #0f0',
                            boxShadow: '4px 4px 0 #fff'
                        }}>
                            START_NOW
                        </a>
                    </div>
                ) : (
                    <>
                        <h2 style={{ fontSize: '20px', marginBottom: '24px', color: '#fff', textShadow: '2px 2px #DC2626', fontFamily: '"Press Start 2P"' }}>SUBMISSION_LOG</h2>

                        {user.submissions.length === 0 ? (
                            <div className="retro-window" style={{ padding: '40px', textAlign: 'center' }}>
                                <p style={{ color: '#888', fontFamily: '"Share Tech Mono"' }}>
                                    NO_RECORDS_FOUND. <a href="/issues" style={{ color: '#0f0' }}>INITIALIZE_CODING</a>
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {user.submissions.map(sub => (
                                    <div key={sub.id} className="retro-window" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ color: '#fff', marginBottom: '8px', fontFamily: '"Share Tech Mono"' }}>{sub.issue?.title || sub.challenge?.title || 'Unknown Submission'}</div>
                                            <div style={{ fontSize: '12px', color: '#666', fontFamily: '"Share Tech Mono"' }}>DATE: {new Date(sub.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                display: 'inline-block', padding: '4px 12px', fontSize: '10px', fontFamily: '"Press Start 2P"',
                                                background: sub.status === 'APPROVED' ? '#0f0' : sub.status === 'REJECTED' ? '#DC2626' : '#888',
                                                color: '#000'
                                            }}>
                                                {sub.status}
                                            </div>
                                            {sub.awardedPoints > 0 && <div style={{ fontSize: '12px', color: '#0f0', marginTop: '8px', fontFamily: '"Share Tech Mono"' }}>+{sub.awardedPoints} PTS</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

            </div>
        </main>
    );
}
