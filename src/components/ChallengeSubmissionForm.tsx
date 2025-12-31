'use client';

import { useState, useEffect, useTransition } from 'react';
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
    const [result, setResult] = useState<{ success: boolean; message?: string; feedback?: string; points?: number; status?: string; rateLimitMs?: number; remainingAttempts?: number; locked?: boolean } | null>(
        previousSubmission ? {
            success: previousSubmission.status === 'APPROVED',
            status: previousSubmission.status,
            feedback: previousSubmission.aiFeedback,
            points: previousSubmission.awardedPoints,
            remainingAttempts: Math.max(0, 3 - (previousSubmission.attemptCount || 0)),
            locked: (previousSubmission.attemptCount || 0) >= 3 && previousSubmission.status !== 'APPROVED'
        } : null
    );

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

    const [isPending, startTransition] = useTransition();

    async function handleSubmit(formData: FormData) {
        // We use the state 'code' instead of getting it from formData's textarea
        const content = code;

        startTransition(async () => {
            try {
                const res = await submitChallenge(challengeId, content);
                setResult(res as any);

                // If rate limited (pre-check failed)
                if (!res.success && res.rateLimitMs) {
                    setRemainingTime(res.rateLimitMs);
                }
                else if (res.status === 'REJECTED') {
                    const expirationTime = 5 * 60 * 1000; // 5 mins
                    setRemainingTime(expirationTime);
                }
            } catch (e: any) {
                setResult({ success: false, message: e.message || "An error occurred" });
            }
        });
    }

    // Format remaining time as MM:SS
    const formatTime = (ms: number) => {
        const totalSeconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}m ${seconds}s`;
    };

    const isRateLimited = remainingTime !== null && remainingTime > 0;
    const isLocked = (result?.locked) || ((previousSubmission?.attemptCount || 0) >= 3 && previousSubmission?.status !== 'APPROVED' && !result?.success);
    const attemptsUsed = result ? (3 - (result.remainingAttempts ?? 3)) : (previousSubmission?.attemptCount || 0);
    const remainingAttemptsCount = result?.remainingAttempts ?? Math.max(0, 3 - (previousSubmission?.attemptCount || 0));

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

    function handleEditorDidMount(editor: any, monaco: any) {
        // Disable pasting via DOM events (Capture phase)
        const container = editor.getContainerDomNode();
        container.addEventListener('paste', (e: any) => {
            e.preventDefault();
            e.stopPropagation();
            alert("Pasting is not allowed in this examination environment.");
        }, true);

        // Disable pasting via Keyboard Shortcuts (Ctrl+V, Cmd+V, Shift+Insert)
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
            alert("Pasting is not allowed in this examination environment.");
        });
        editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Insert, () => {
            alert("Pasting is not allowed in this examination environment.");
        });

        // Disable Context Menu (Redundant with options, but good for safety)
        editor.onContextMenu((e: any) => {
            e.event.preventDefault();
        });
    }

    // Locked State UI
    if (isLocked) {
        return (
            <div style={{ padding: '24px', background: '#1a1a1a', borderRadius: '16px', border: '1px solid #333' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#DC2626', fontFamily: '"Press Start 2P"', fontSize: '14px' }}>LOCKED</h3>
                <p style={{ margin: '0 0 16px 0', color: '#ccc', fontFamily: '"Share Tech Mono"' }}>
                    You have used all 3 attempts for this problem. Access is now locked.
                </p>
                <div style={{ padding: '16px', background: '#000', borderRadius: '8px', border: '1px solid #333' }}>
                    <strong style={{ display: 'block', marginBottom: '8px', color: '#666', fontSize: '12px' }}>LAST_FEEDBACK:</strong>
                    <div style={{ whiteSpace: 'pre-wrap', color: '#DC2626', fontFamily: 'monospace', fontSize: '14px' }}>{result?.feedback || previousSubmission?.aiFeedback}</div>
                </div>
                <p style={{ marginTop: '24px', color: '#666', fontSize: '12px', fontFamily: '"Share Tech Mono"' }}>
                    &gt; SYSTEM: Please proceed to the next available challenge.
                </p>
            </div>
        );
    }

    return (
        <form action={handleSubmit}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{
                    fontFamily: '"Press Start 2P"',
                    fontSize: '10px',
                    color: remainingAttemptsCount > 1 ? '#0f0' : '#DC2626',
                    background: '#1a1a1a',
                    padding: '8px 12px',
                    border: `1px solid ${remainingAttemptsCount > 1 ? '#0f0' : '#DC2626'}`
                }}>
                    ATTEMPTS: {attemptsUsed}/3
                </span>
            </div>
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
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        contextmenu: false // Disable context menu to further discourage pasting via GUI
                    }}
                />
            </div>

            <button
                type="submit"
                disabled={isPending || isRateLimited}
                style={{
                    background: (isPending || isRateLimited) ? '#9ca3af' : '#0071e3',
                    // ... existing styles ...
                    justifyContent: 'center'
                }}
            >
                {isPending && <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
                {isPending ? 'Processing...' : isRateLimited ? 'Rate Limited' : 'Submit Solution'}
                <style jsx>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </button>
        </form>
    );
}
