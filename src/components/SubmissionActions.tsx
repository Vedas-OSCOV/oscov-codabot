'use client';

import { reviewSubmission } from "@/app/actions/admin";
import { useState } from "react";

export default function SubmissionActions({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);

    const handleReview = async (decision: 'APPROVED' | 'REJECTED') => {
        if (!confirm(`Are you sure you want to ${decision} this submission?`)) return;

        setLoading(true);
        await reviewSubmission(id, decision);
        setLoading(false);
    };

    return (
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button
                onClick={() => handleReview('APPROVED')}
                disabled={loading}
                className="button-primary"
                style={{ fontSize: '13px', padding: '8px 16px', backgroundColor: '#34c759', opacity: loading ? 0.5 : 1 }}
            >
                Approve
            </button>
            <button
                onClick={() => handleReview('REJECTED')}
                disabled={loading}
                className="button-primary"
                style={{ fontSize: '13px', padding: '8px 16px', backgroundColor: '#ff3b30', opacity: loading ? 0.5 : 1 }}
            >
                Reject
            </button>
        </div>
    );
}
