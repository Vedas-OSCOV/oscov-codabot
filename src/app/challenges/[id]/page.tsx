import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ChallengeSubmissionForm from "@/components/ChallengeSubmissionForm";

export const dynamic = 'force-dynamic';

export default async function ChallengeDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id: challengeId } = params;



    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect('/api/auth/signin');
    }

    const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId }
    });

    if (!challenge) {
        return <div>Challenge not found</div>;
    }

    const submission = await prisma.submission.findFirst({
        where: { userId: session.user.id, challengeId: challenge.id }
    });

    const isSolved = submission?.status === 'APPROVED';

    return (
        <main style={{ minHeight: '100vh', paddingTop: '100px', background: '#FAFAFA' }}>
            <Navbar />
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
                <a href="/challenges" style={{ color: '#666', fontSize: '14px', marginBottom: '24px', display: 'inline-block' }}>← Back to Challenges</a>

                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#0071e3', background: 'rgba(0,113,227,0.1)', padding: '4px 12px', borderRadius: '99px' }}>
                            {challenge.difficulty}
                        </span>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#666', background: 'rgba(0,0,0,0.05)', padding: '4px 12px', borderRadius: '99px' }}>
                            {challenge.points} Points
                        </span>
                        {isSolved && (
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', background: '#dcfce7', padding: '4px 12px', borderRadius: '99px' }}>
                                SOLVED
                            </span>
                        )}
                    </div>
                    <h1 style={{ fontSize: '36px', fontWeight: '700', margin: 0, lineHeight: 1.2 }}>{challenge.title}</h1>
                </div>

                <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Problem Description</h2>
                    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
                        {challenge.description}
                    </p>
                </div>

                <div className="glass-panel" style={{ padding: '32px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Submission</h2>

                    {isSolved ? (
                        <div style={{ padding: '24px', background: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                            <h3 style={{ margin: '0 0 8px 0', color: '#166534' }}>Challenge Complete!</h3>
                            <p style={{ margin: 0, color: '#15803d' }}>
                                You earned {submission?.awardedPoints} points.
                            </p>
                            <div style={{ marginTop: '16px' }}>
                                <strong>Feedback:</strong>
                                <p style={{ whiteSpace: 'pre-wrap', color: '#444' }}>{submission?.aiFeedback}</p>
                            </div>
                        </div>
                    ) : (
                        <ChallengeSubmissionForm challengeId={challenge.id} previousSubmission={submission} />
                    )}
                </div>

            </div>
        </main>
    );
}
