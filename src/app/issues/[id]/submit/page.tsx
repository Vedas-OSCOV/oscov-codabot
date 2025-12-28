'use client';

import { useActionState } from 'react';
import { submitSolution } from '@/app/actions/submit';
import styles from './submit.module.css';
import { useParams } from 'next/navigation';

const initialState = {
    message: '',
    error: ''
}

export default function SubmitPage() {
    const params = useParams();
    const issueId = params.id as string;

    const submitWithId = submitSolution.bind(null, issueId);

    const [state, formAction, isPending] = useActionState(async (prev: any, formData: FormData) => {
        const result = await submitWithId(formData);
        if (result.error) return { error: result.error, message: '' };
        return { message: 'Solution submitted! AI is analyzing it now...', error: '' };
    }, initialState);


    return (
        <div className={styles.container}>
            <div className="glass-panel" style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
                <h1 className={styles.title}>Submit Solution</h1>
                <p className={styles.desc}>
                    Paste the link to your Pull Request. Our AI will perform an initial check before manual review.
                </p>

                <form action={formAction} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>GitHub PR URL</label>
                        <input
                            name="prUrl"
                            type="text"
                            className={styles.input}
                            placeholder="https://github.com/owner/repo/pull/123"
                            required
                        />
                    </div>

                    {state.error && <p className={styles.error}>{state.error}</p>}
                    {state.message && <div className={styles.success}>
                        <p>{state.message}</p>
                        <p style={{ fontSize: '13px', marginTop: '8px', opacity: 0.8 }}>You can track status on your dashboard.</p>
                    </div>}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="button-primary"
                        style={{ marginTop: '24px', width: '100%', opacity: isPending ? 0.7 : 1 }}
                    >
                        {isPending ? 'Analyzing with AI...' : 'Submit for Review'}
                    </button>
                </form>
            </div>
        </div>
    );
}
