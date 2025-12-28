import Link from 'next/link';
import styles from './Navbar.module.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SignOutButton from './SignOutButton';

export default async function Navbar() {
    const session = await getServerSession(authOptions);

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
                    {session ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {session.user?.image && (
                                <img
                                    src={session.user.image}
                                    alt="Profile"
                                    style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #eee' }}
                                />
                            )}
                            <Link href="/dashboard" className={styles.link}>
                                Dashboard
                            </Link>
                            {session.user?.role === 'ADMIN' && (
                                <Link href="/admin" className={styles.link}>
                                    Admin
                                </Link>
                            )}
                            <SignOutButton />
                        </div>
                    ) : (
                        <Link href="/api/auth/signin" className={styles.login}>
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
