'use client';

import { useState } from 'react';
import { submitChallenge } from '@/app/actions/submit-challenge';
import { useFormStatus } from 'react-dom';

export default function ChallengeSubmissionForm({ challengeId, previousSubmission }: { challengeId: string, previousSubmission: any }) {
    const [result, setResult] = useState<{ success: boolean; message?: string; feedback?: string; points?: number; status?: string } | null>(
        previousSubmission ? { success: previousSubmission.status === 'APPROVED', status: previousSubmission.status, feedback: previousSubmission.aiFeedback, points: previousSubmission.aiScore } : null
    );
    const [pending, setPending] = useState(false);

    async function handleSubmit(formData: FormData) {
        setPending(true);
        const content = formData.get('content') as string;

        try {
            const res = await submitChallenge(challengeId, content);
            setResult(res as any);
        } catch (e: any) {
            setResult({ success: false, message: e.message || "An error occurred" });
        } finally {
            setPending(false);
        }
    }

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

    // ... (rest of the component)

    return (
        <button
            type="submit"
            disabled={pending}
            style={{
                background: pending ? '#9ca3af' : '#0071e3',
                color: 'white',
                padding: '12px 32px',
                borderRadius: '99px',
                border: 'none',
                fontWeight: '600',
                cursor: pending ? 'not-allowed' : 'pointer',
                opacity: pending ? 0.9 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '180px',
                justifyContent: 'center'
            }}
        >
            {pending && <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
            {pending ? 'Grading Solution...' : 'Submit Solution'}
            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </button>
    );
}
