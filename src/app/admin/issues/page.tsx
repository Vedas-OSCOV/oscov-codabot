'use client';
import styles from './issues.module.css';
import { createIssue } from '@/app/actions/issues';
import { useActionState } from 'react';

const initialState = {
    message: '',
    error: ''
}

export default function ManageIssues() {
    const [state, formAction, isPending] = useActionState(async (prev: any, formData: FormData) => {
        const result = await createIssue(formData);
        if (result.error) return { error: result.error, message: '' };
        return { message: 'Issue added successfully!', error: '' };
    }, initialState);

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Manage Issues</h1>

            <div className="glass-panel" style={{ padding: '32px', maxWidth: '600px', marginBottom: '40px' }}>
                <h3 className={styles.sectionTitle}>Add New Issue</h3>
                <p className={styles.helpText}>Paste the full GitHub URL of the issue/PR you want to add to the marathon.</p>

                <form action={formAction} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>GitHub Issue URL</label>
                        <input
                            name="url"
                            type="text"
                            className={styles.input}
                            placeholder="https://github.com/..."
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Points Reward</label>
                        <input
                            name="points"
                            type="number"
                            className={styles.input}
                            placeholder="e.g. 50"
                            style={{ width: '120px' }}
                            required
                        />
                    </div>

                    {state.error && <p style={{ color: 'red', fontSize: '14px' }}>{state.error}</p>}
                    {state.message && <p style={{ color: 'green', fontSize: '14px' }}>{state.message}</p>}

                    <button type="submit" disabled={isPending} className="button-primary" style={{ marginTop: '16px', opacity: isPending ? 0.7 : 1 }}>
                        {isPending ? 'Fetching...' : 'Fetch & Add'}
                    </button>
                </form>
            </div>

            <div className={styles.listSection}>
                <h3 className={styles.sectionTitle}>Active Issues</h3>
                {/* List will replace this placeholder */}
                <div className={styles.emptyState}>No issues active yet.</div>
            </div>

        </div>
    );
}
