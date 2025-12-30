import Link from 'next/link';
import styles from './admin-layout.module.css';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    Control Center
                </div>
                <nav className={styles.nav}>
                    <Link href="/admin" className={styles.link}>
                        Overview
                    </Link>
                    <Link href="/admin/usage" className={styles.link}>
                        Usage Metrics
                    </Link>
                    <Link href="/admin/monitoring" className={styles.link}>
                        Deep Monitoring
                    </Link>
                    <div className={styles.divider} />
                    <Link href="/" className={styles.backLink}>
                        ← Back to Public
                    </Link>
                </nav>
            </aside>
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
