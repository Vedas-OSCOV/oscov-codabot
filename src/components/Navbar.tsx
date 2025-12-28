import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
    return (
        <nav className={styles.nav}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    Vedas-OSCOV
                </Link>
                <div className={styles.links}>
                    <Link href="/issues" className={styles.link}>
                        Issues
                    </Link>
                    <Link href="/leaderboard" className={styles.link}>
                        Leaderboard
                    </Link>
                    <Link href="/api/auth/signin" className={styles.login}>
                        Sign In
                    </Link>
                </div>
            </div>
        </nav>
    );
}
