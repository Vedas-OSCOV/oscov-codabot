'use client';
import styles from './issues.module.css';
import { useState } from 'react';

export default function ManageIssues() {
    const [url, setUrl] = useState('');

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Manage Issues</h1>

            <div className="glass-panel" style={{ padding: '32px', maxWidth: '600px', marginBottom: '40px' }}>
                <h3 className={styles.sectionTitle}>Add New Issue</h3>
                <p className={styles.helpText}>Paste the full GitHub URL of the issue/PR you want to add to the marathon.</p>

                <form className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>GitHub Issue URL</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="https://github.com/..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Points Reward</label>
                        <input type="number" className={styles.input} placeholder="e.g. 50" style={{ width: '120px' }} />
                    </div>

                    <button type="button" className="button-primary" style={{ marginTop: '16px' }}>
                        Fetch & Add
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
