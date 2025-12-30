import Link from 'next/link';
import styles from './Navbar.module.css';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import SignOutButton from './SignOutButton';

import { prisma } from '@/lib/db';

export default async function Navbar() {
    const session = await getServerSession(authOptions);

    return (
        <div style={{ height: '80px' }}> {/* Spacer for fixed nav */}
            <nav className={styles.nav} style={{
                background: 'rgba(0, 0, 0, 0.95)',
                borderBottom: '4px solid #fff',
                padding: '16px 0',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                width: '100%',
                boxShadow: '0 4px 0 rgba(220, 38, 38, 0.2)'
            }}>
                <div className={styles.container} style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 32px'
                }}>
                    <Link href="/" className={styles.logo} style={{
                        fontFamily: '"Press Start 2P", cursive',
                        color: '#fff',
                        fontSize: '20px',
                        textShadow: '3px 3px #DC2626',
                        textDecoration: 'none'
                    }}>
                        VEDAS_OSCOV
                    </Link>

                    <div className={styles.links} style={{
                        display: 'flex',
                        gap: '32px',
                        alignItems: 'center',
                        fontFamily: '"Share Tech Mono", monospace'
                    }}>
                        <Link href="/challenges" className={styles.link} style={{
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            color: '#ccc',
                            fontSize: '16px'
                        }}>
                            &gt; CHALLENGES
                        </Link>
                        <Link href="/leaderboard" className={styles.link} style={{
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            color: '#ccc',
                            fontSize: '16px'
                        }}>
                            &gt; LEADERBOARD
                        </Link>

                        {session ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: '24px' }}>
                                {session.user?.image && (
                                    <img
                                        src={session.user.image}
                                        alt="Profile"
                                        style={{ width: 36, height: 36, border: '2px solid #fff', borderRadius: '0', boxShadow: '2px 2px 0 #DC2626' }}
                                    />
                                )}
                                <Link href="/dashboard" className={styles.link} style={{ textTransform: 'uppercase', color: '#fff', borderBottom: '2px solid #DC2626' }}>
                                    DASHBOARD
                                </Link>
                                {session.user?.role === 'ADMIN' && (
                                    <Link href="/admin" className={styles.link} style={{ color: '#DC2626', fontWeight: 'bold' }}>
                                        [ROOT]
                                    </Link>
                                )}
                                <SignOutButton />
                            </div>
                        ) : (
                            <Link href="/api/auth/signin" style={{
                                fontFamily: '"Press Start 2P"',
                                fontSize: '12px',
                                background: '#DC2626',
                                color: '#fff',
                                padding: '12px 20px',
                                border: '3px solid #fff',
                                boxShadow: '4px 4px 0 #000',
                                textDecoration: 'none',
                                marginLeft: '24px'
                            }}>
                                INSERT_COIN
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}
