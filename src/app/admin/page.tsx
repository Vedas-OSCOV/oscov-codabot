import styles from './admin-page.module.css';

export default function AdminDashboard() {
    return (
        <div className={styles.container}>

            <div className={styles.header}>
                <h1 className={styles.title}>Dashboard</h1>
                <p className={styles.date}>Overview</p>
            </div>

            <div className={styles.grid}>
                <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
                    <h3 className={styles.cardTitle}>Create New Issue</h3>
                    <p className={styles.cardDesc}>Import from GitHub URL</p>
                    <a href="/admin/issues" className="button-primary" style={{ display: 'inline-block', marginTop: '16px' }}>
                        New Issue +
                    </a>
                </div>

                <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
                    <h3 className={styles.cardTitle}>Pending Review</h3>
                    <p className={styles.bigNumber}>0</p>
                    <p className={styles.cardDesc}>Submissions waiting</p>
                </div>

                <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
                    <h3 className={styles.cardTitle}>Marathon Stats</h3>
                    <div className={styles.statRow}>
                        <span>Active Users</span>
                        <span>0</span>
                    </div>
                    <div className={styles.statRow}>
                        <span>Issues Solved</span>
                        <span>0</span>
                    </div>
                </div>
            </div>

        </div>
    );
}
