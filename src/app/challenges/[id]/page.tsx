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
        where: { userId: session.user.id, challengeId: challenge.id },
        select: {
            id: true,
            status: true,
            aiFeedback: true,
            awardedPoints: true,
            lastSubmittedAt: true,
            attemptCount: true
        }
    });

    // Fetch globally latest submission for rate limiting across ALL challenges
    const globalLatestSubmission = await prisma.submission.findFirst({
        where: { userId: session.user.id, lastSubmittedAt: { not: null } },
        orderBy: { lastSubmittedAt: 'desc' },
        select: { lastSubmittedAt: true, status: true }
    });

    const isSolved = submission?.status === 'APPROVED';

    let rateLimitRemainingMs = null;
    if (globalLatestSubmission && globalLatestSubmission.status === 'REJECTED' && globalLatestSubmission.lastSubmittedAt) {
        const RATE_LIMIT_MS = 5 * 60 * 1000;
        const timeSinceLastSubmit = Date.now() - globalLatestSubmission.lastSubmittedAt.getTime();
        if (timeSinceLastSubmit < RATE_LIMIT_MS) {
            rateLimitRemainingMs = RATE_LIMIT_MS - timeSinceLastSubmit;
        }
    }

    return (
        <main style={{ minHeight: '100vh', paddingTop: '100px' }}>
            <Navbar />
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
                <a href="/challenges" style={{ color: '#888', fontSize: '14px', marginBottom: '24px', display: 'inline-block', fontFamily: '"Share Tech Mono"' }}>&lt; BACK_TO_LIST</a>

                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '10px', color: '#fff', background: '#DC2626', padding: '6px 12px', fontFamily: '"Press Start 2P"' }}>
                            {challenge.difficulty}
                        </span>
                        <span style={{ fontSize: '10px', color: '#fff', border: '2px solid #fff', padding: '4px 12px', fontFamily: '"Press Start 2P"' }}>
                            {challenge.points} PTS
                        </span>
                        {isSolved && (
                            <span style={{ fontSize: '10px', color: '#000', background: '#0f0', padding: '6px 12px', fontFamily: '"Press Start 2P"' }}>
                                SOLVED
                            </span>
                        )}
                    </div>
                    <h1 style={{ fontSize: '24px', margin: 0, lineHeight: 1.4, color: '#fff', textShadow: '2px 2px #DC2626' }}>{challenge.title}</h1>
                </div>

                <div className="retro-window" style={{ padding: '32px', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '16px', marginBottom: '24px', color: '#DC2626' }}>PROBLEM_DESCRIPTION</h2>
                    <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#ccc', fontFamily: '"Share Tech Mono"' }}>
                        {challenge.description}
                    </div>
                </div>

                <div className="retro-window" style={{ padding: '32px' }}>
                    <h2 style={{ fontSize: '16px', marginBottom: '24px', color: '#DC2626' }}>SUBMISSION_CONSOLE</h2>

                    {isSolved ? (
                        <div style={{ padding: '24px', border: '2px solid #0f0' }}>
                            <h3 style={{ margin: '0 0 16px 0', color: '#0f0', fontFamily: '"Press Start 2P"', fontSize: '12px' }}>CHALLENGE_COMPLETE!</h3>
                            <p style={{ margin: 0, color: '#fff', fontFamily: '"Share Tech Mono"' }}>
                                System awarded {submission?.awardedPoints} points to your profile.
                            </p>
                            <div style={{ marginTop: '24px', borderTop: '1px dashed #333', paddingTop: '16px' }}>
                                <strong style={{ color: '#888', fontSize: '12px' }}>AI_JUDGE_OUTPUT:</strong>
                                <p style={{ whiteSpace: 'pre-wrap', color: '#0f0', fontFamily: 'monospace', fontSize: '14px', marginTop: '8px' }}>{submission?.aiFeedback}</p>
                            </div>
                        </div>
                    ) : (
                        <ChallengeSubmissionForm
                            challengeId={challenge.id}
                            previousSubmission={submission ? {
                                ...submission,
                                lastSubmittedAt: submission.lastSubmittedAt?.toISOString() || null
                            } : null}
                            globalLastSubmission={globalLatestSubmission ? {
                                lastSubmittedAt: globalLatestSubmission.lastSubmittedAt?.toISOString() || null,
                                status: globalLatestSubmission.status
                            } : null}
                            initialRemainingTime={rateLimitRemainingMs}
                        />
                    )}
                </div>

            </div>
        </main>
    );
}
