import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

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
        <main style={{ minHeight: '100vh', paddingTop: '100px', background: '#FAFAFA' }}>
            <Navbar />
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>

                <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                    {user.image && <img src={user.image} style={{ width: 80, height: 80, borderRadius: '50%' }} />}
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '700', margin: 0 }}>{user.name}</h1>
                        <p style={{ color: '#666', marginTop: '8px' }}>
                            {isFirstSemester ? 'Fresher (Semester 1)' : `Semester ${user.semester} Student`}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>Total Score</h3>
                        <div style={{ fontSize: '48px', fontWeight: '700' }}>{user.score}</div>
                    </div>
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase', marginBottom: '8px' }}>
                            {isFirstSemester ? 'Challenges Solved' : 'Submissions'}
                        </h3>
                        <div style={{ fontSize: '48px', fontWeight: '700' }}>{user.submissions.length}</div>
                    </div>
                </div>

                {isFirstSemester ? (
                    <div style={{ marginBottom: '40px', padding: '32px', background: 'linear-gradient(135deg, #0071e3 0%, #00c6fb 100%)', borderRadius: '24px', color: 'white', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Beginner Challenges</h2>
                        <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
                            Prove your worth. Solve extremely hard theoretical and DSA problems to earn your place.
                        </p>
                        <a href="/challenges" className="glass-panel" style={{
                            display: 'inline-block',
                            padding: '12px 32px',
                            color: '#0071e3',
                            background: 'white',
                            fontWeight: '600',
                            borderRadius: '99px',
                            textDecoration: 'none'
                        }}>
                            Start Challenges
                        </a>
                    </div>
                ) : (
                    <>
                        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>My Submissions</h2>

                        {user.submissions.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#888', background: 'white', borderRadius: '16px' }}>
                                You haven't submitted any solutions yet. <a href="/issues" style={{ color: '#0071e3' }}>Start Coding!</a>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {user.submissions.map(sub => (
                                    <div key={sub.id} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{sub.issue?.title || sub.challenge?.title || 'Unknown Submission'}</div>
                                            <div style={{ fontSize: '13px', color: '#666' }}>Submitted on {new Date(sub.createdAt).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                display: 'inline-block', padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '600',
                                                background: sub.status === 'APPROVED' ? '#dcfce7' : sub.status === 'REJECTED' ? '#fee2e2' : '#f3f4f6',
                                                color: sub.status === 'APPROVED' ? '#166534' : sub.status === 'REJECTED' ? '#991b1b' : '#374151'
                                            }}>
                                                {sub.status}
                                            </div>
                                            {sub.awardedPoints > 0 && <div style={{ fontSize: '13px', color: '#166534', marginTop: '4px' }}>+{sub.awardedPoints} pts</div>}
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
