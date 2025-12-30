'use client';

import { useState, useEffect } from 'react';
import { submitChallenge } from '@/app/actions/submit-challenge';
import Editor from '@monaco-editor/react';

export default function ChallengeSubmissionForm({
    challengeId,
    previousSubmission,
    globalLastSubmission
}: {
    challengeId: string,
    previousSubmission: any,
    globalLastSubmission?: { lastSubmittedAt: Date | null, status: string } | null
}) {
    const [result, setResult] = useState<{ success: boolean; message?: string; feedback?: string; points?: number; status?: string; rateLimitMs?: number } | null>(
        previousSubmission ? { success: previousSubmission.status === 'APPROVED', status: previousSubmission.status, feedback: previousSubmission.aiFeedback, points: previousSubmission.aiScore } : null
    );
    const [pending, setPending] = useState(false);
    const [code, setCode] = useState("// Write your solution here...\n\nfunction solution() {\n  // your code\n}");
    const [remainingTime, setRemainingTime] = useState<number | null>(null);

    // Calculate initial remaining time from Global Rate Limit (only if blocked)
    useEffect(() => {
        // use global submission if available and REJECTED
        const lastSubmitDate = globalLastSubmission?.lastSubmittedAt || previousSubmission?.lastSubmittedAt;
        const lastStatus = globalLastSubmission?.status || previousSubmission?.status;

        // ONLY rate limit if the last attempt was REJECTED
        if (lastSubmitDate && lastStatus === 'REJECTED') {
            const RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes
            const lastSubmitTime = new Date(lastSubmitDate).getTime();
            const now = Date.now();
            const elapsed = now - lastSubmitTime;
            const remaining = RATE_LIMIT_MS - elapsed;

            console.log('Rate Limit Debug:', {
                lastSubmitDate,
                lastSubmitTime,
                now,
                elapsed,
                remaining
            });

            if (remaining > 0) {
                setRemainingTime(remaining);
            } else {
                setRemainingTime(null);
            }
        }
    }, [globalLastSubmission, previousSubmission]);

    // Countdown timer
    useEffect(() => {
        if (remainingTime === null || remainingTime <= 0) return;

        const interval = setInterval(() => {
            setRemainingTime(prev => {
                if (prev === null || prev <= 1000) {
                    clearInterval(interval);
                    return null;
                }
                return prev - 1000;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [remainingTime]);

    async function handleSubmit(formData: FormData) {
        setPending(true);
        // We use the state 'code' instead of getting it from formData's textarea
        const content = code;

        try {
            const res = await submitChallenge(challengeId, content);
            setResult(res as any);

            // If rate limited (pre-check failed)
            if (!res.success && res.rateLimitMs) {
                setRemainingTime(res.rateLimitMs);
            }
            // If submitted and REJECTED (fresh failure)
            else if (res.status === 'REJECTED') {
                // Start the countdown immediately
                const expirationTime = 5 * 60 * 1000; // 5 mins
                setRemainingTime(expirationTime);
            }
        } catch (e: any) {
            setResult({ success: false, message: e.message || "An error occurred" });
        } finally {
            setPending(false);
        }
    }

    // Format remaining time as MM:SS
    const formatTime = (ms: number) => {
        const totalSeconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}m ${seconds}s`;
    };

    const isRateLimited = remainingTime !== null && remainingTime > 0;

    if (result && result.status === 'APPROVED') {
        return (
            <div style={{ padding: '24px', background: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#166534' }}>Challenge Complete!</h3>
                <p style={{ margin: 0, color: '#15803d' }}>
                    You earned {result.points} points.
                </p>
                <div style={{ marginTop: '16px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <strong style={{ display: 'block', marginBottom: '8px', color: '#374151' }}>Feedback:</strong>
                    <div style={{ whiteSpace: 'pre-wrap', color: '#444', fontFamily: 'monospace', fontSize: '14px' }}>{result.feedback}</div>
                </div>
            </div>
        );
    }

    return (
        <form action={handleSubmit}>
            {previousSubmission && previousSubmission.status === 'REJECTED' && (
                <div style={{ padding: '16px', background: '#fee2e2', borderRadius: '12px', border: '1px solid #fecaca', marginBottom: '16px' }}>
                    <strong style={{ color: '#991b1b' }}>Previous Attempt Rejected</strong>
                    <p style={{ margin: '8px 0 0 0', color: '#7f1d1d', fontSize: '14px' }}>{previousSubmission.aiFeedback}</p>
                </div>
            )}

            {result && result.status === 'REJECTED' && !previousSubmission && (
                <div style={{ padding: '16px', background: '#fee2e2', borderRadius: '12px', border: '1px solid #fecaca', marginBottom: '16px' }}>
                    <strong style={{ color: '#991b1b' }}>Submission Rejected</strong>
                    <p style={{ margin: '8px 0 0 0', color: '#7f1d1d', fontSize: '14px' }}>{result.feedback}</p>
                </div>
            )}

            {result?.message && !result.success && !result.status && (
                <div style={{ color: 'red', marginBottom: '16px' }}>{result.message}</div>
            )}

            {/* Rate Limit Warning */}
            {isRateLimited && (
                <div style={{
                    padding: '16px',
                    background: '#1a1a1a',
                    border: '2px solid #DC2626',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontFamily: '"Share Tech Mono"'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{
                            fontSize: '10px',
                            color: '#000',
                            background: '#DC2626',
                            padding: '6px 12px',
                            fontFamily: '"Press Start 2P"'
                        }}>
                            RATE_LIMIT
                        </span>
                        <span style={{ color: '#DC2626', fontSize: '16px', fontWeight: 'bold' }}>
                            {formatTime(remainingTime)}
                        </span>
                    </div>
                    <p style={{ margin: 0, color: '#ccc', fontSize: '14px' }}>
                        Please wait before resubmitting. This prevents excessive API usage on our end.
                    </p>
                </div>
            )}

            <div style={{ marginBottom: '16px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <div style={{ background: '#f5f5f5', padding: '8px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '12px', color: '#666', display: 'flex', justifyContent: 'space-between' }}>

                    <span>EDITOR MODE</span>
                    <span>JAVASCRIPT / PYTHON / PSEUDO</span>
                </div>
                <Editor
                    height="400px"
                    defaultLanguage="javascript"
                    theme="light"
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        automaticLayout: true
                    }}
                />
            </div>

            <button
                type="submit"
                disabled={pending || isRateLimited}
                style={{
                    background: (pending || isRateLimited) ? '#9ca3af' : '#0071e3',
                    // ... existing styles ...
                    justifyContent: 'center'
                }}
            >
                {pending && <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
                {pending ? 'Processing...' : isRateLimited ? 'Rate Limited' : 'Submit Solution'}
                <style jsx>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </button>
        </form>
    );
}
