import styles from './analytics.module.css';
import Link from 'next/link';

export default function AnalyticsLandingPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Post-Event Analytics</h1>
                <p className={styles.subtitle}>
                    Deep dive into every aspect of the event. Select a module from the sidebar to begin autopsying the data.
                </p>
            </header>

            <div className={styles.grid}>
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Available Modules</h2>
                    <ul style={{ color: '#ccc', lineHeight: '2' }}>
                        <li>📊 <strong>Event Health:</strong> High-level participation metrics.</li>
                        <li>⏳ <strong>Time Behavior:</strong> When were users active?</li>
                        <li>💀 <strong>Funnel Autopsy:</strong> Where did users drop off?</li>
                        <li>📝 <strong>Problem Analysis:</strong> Difficulty & quality checks.</li>
                        <li>📉 <strong>Difficulty Curve:</strong> User progression vs walls.</li>
                        <li>🕵️ <strong>Leaderboard Audit:</strong> Cheating detection.</li>
                        <li>💻 <strong>Language Insights:</strong> Tech stack usage.</li>
                        <li>🎣 <strong>Retention:</strong> Engagement depth.</li>
                        <li>💰 <strong>Reward Economics:</strong> Point distribution.</li>
                        <li>⚙️ <strong>System Reliability:</strong> Platform performance.</li>
                        <li>👥 <strong>Cohorts:</strong> Freshers vs Seniors.</li>
                        <li>💡 <strong>Final Insights:</strong> Automated conclusions.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
