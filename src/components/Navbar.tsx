import Link from 'next/link';
import styles from './Navbar.module.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SignOutButton from './SignOutButton';

import { prisma } from '@/lib/db';

export default async function Navbar() {
    const session = await getServerSession(authOptions);
    let isSemester1 = false;

    if (session?.user?.email) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });
        if (user?.semester === 1) {
            isSemester1 = true;
        }
    }

    return (
        <nav className={styles.nav} style={{
            background: '#000',
            borderBottom: '4px solid white',
            padding: '20px 0',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className={styles.container} style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
                <Link href="/" className={styles.logo} style={{
                    fontFamily: '"Press Start 2P", cursive',
                    color: '#fff',
                    fontSize: '16px',
                    textShadow: '2px 2px #DC2626'
                }}>
                    VEDAS_OSCOV
                </Link>
                <div className={styles.links} style={{ display: 'flex', gap: '24px', alignItems: 'center', fontFamily: '"Share Tech Mono", monospace' }}>
                    <Link href="/challenges" className={styles.link} style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                        [Challenges]
                    </Link>
                    <Link href="/leaderboard" className={styles.link} style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                        [Leaderboard]
                    </Link>
                    {session ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {session.user?.image && (
                                <img
                                    src={session.user.image}
                                    alt="Profile"
                                    style={{ width: 32, height: 32, border: '2px solid white', borderRadius: '0' }}
                                />
                            )}
                            <Link href="/dashboard" className={styles.link} style={{ textTransform: 'uppercase' }}>
                                DASHBOARD
                            </Link>
                            {session.user?.role === 'ADMIN' && (
                                <Link href="/admin" className={styles.link} style={{ color: '#DC2626' }}>
                                    ADMIN_SHELL
                                </Link>
                            )}
                            <SignOutButton />
                        </div>
                    ) : (
                        <Link href="/api/auth/signin" style={{
                            fontFamily: '"Press Start 2P"',
                            fontSize: '10px',
                            background: '#fff',
                            color: '#000',
                            padding: '10px 16px',
                            border: '2px solid #DC2626'
                        }}>
                            INSERT COIN
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
