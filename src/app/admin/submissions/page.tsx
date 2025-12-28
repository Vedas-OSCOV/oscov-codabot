import styles from './submissions.module.css';

export default function ReviewSubmissions() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Review Submissions</h1>

            <div className={styles.filterBar}>
                <span className={styles.activeFilter}>Pending AI</span>
                <span className={styles.filter}>Pending Review</span>
                <span className={styles.filter}>Approved</span>
            </div>

            <div className={styles.list}>
                {/* Placeholder for when data is connected */}
                <div className={styles.emptyState}>
                    All caught up! No submissions pending.
                </div>
            </div>
        </div>
    );
}
