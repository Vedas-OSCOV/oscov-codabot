"use client";

import { useEffect, useState } from 'react';
import styles from './admin-page.module.css';
import { getAdminStats } from '@/app/actions/admin-stats';
import { toggleBanUser } from '@/app/actions/user-management';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const handleBan = async (userId: string) => {
        if (!confirm("Are you sure you want to ban/unban this user?")) return;

        try {
            const res = await toggleBanUser(userId);
            if (res.success) {
                // Optimistic update
                setStats((prev: any) => ({
                    ...prev,
                    userStats: prev.userStats.map((u: any) =>
                        u.id === userId ? { ...u, isBanned: res.isBanned } : u
                    )
                }));
            }
        } catch (e) {
            alert("Failed to update ban status");
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAdminStats();
                setStats(data);
            } catch (e) {
                console.error("Polling error", e);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        // Poll less frequently to save DB calls, maybe 15s
        const interval = setInterval(fetchStats, 15000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.container}>

            <div className={styles.header}>
                <h1 className={styles.title} style={{ color: '#DC2626', textShadow: '2px 2px white' }}>ADMIN_ROOT</h1>
                <p className={styles.date} style={{ fontFamily: '"Share Tech Mono"', color: '#fff' }}>
                    SYSTEM STATUS: {loading ? 'SYNCING...' : 'ONLINE'}
                </p>
            </div>

            {/* Top Row: KPIs */}
            <div className={styles.grid}>
                <div className="retro-window" style={{ flex: 1 }}>
                    <h3 className={styles.cardTitle} style={{ color: '#fff' }}>TOTAL_OPS</h3>
                    <p className={styles.bigNumber} style={{ color: '#fff', textShadow: '2px 2px 0px #DC2626' }}>
                        {stats?.totalSubmissions || 0}
                    </p>
                    <p className={styles.cardDesc}>Global Submissions</p>
                </div>

                <div className="retro-window" style={{ flex: 1 }}>
                    <h3 className={styles.cardTitle} style={{ color: '#fff' }}>ACTIVE_NODES</h3>
                    <p className={styles.bigNumber} style={{ color: '#0f0', textShadow: '2px 2px 0px #000' }}>
                        {stats?.activeUsersCount || 0}
                    </p>
                    <p className={styles.cardDesc}>Users Online</p>
                </div>

                <div className="retro-window" style={{ flex: 1 }}>
                    <h3 className={styles.cardTitle} style={{ color: '#fff' }}>BURN_RATE estimated</h3>
                    <p className={styles.bigNumber} style={{ color: '#fbbf24', textShadow: '2px 2px 0px #000' }}>
                        ${stats?.estimatedCost?.toFixed(2) || '0.00'}
                    </p>
                    <p className={styles.cardDesc}>OpenAI Cost (Approx)</p>
                </div>
            </div>

            {/* Middle Row: Charts & Logs */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '24px' }}>

                {/* Usage Chart */}
                <div className="retro-window" style={{ flex: 2, minWidth: '300px' }}>
                    <h3 style={{ color: 'white', marginBottom: '16px' }}>TRAFFIC_VOLUME (7 DAYS)</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '5%', paddingBottom: '20px', borderBottom: '1px solid #333' }}>
                        {stats?.usageHistory?.map((day: any) => {
                            // Normalize height
                            const max = Math.max(...stats.usageHistory.map((d: any) => d.count)) || 1;
                            const height = Math.max((day.count / max) * 100, 5); // min 5%
                            return (
                                <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '100%', height: `${height}%`, background: '#DC2626', minHeight: '4px' }} title={`${day.count} submissions`}></div>
                                    <span style={{ fontSize: '10px', color: '#666', transform: 'rotate(-45deg)', transformOrigin: 'left bottom', whiteSpace: 'nowrap' }}>
                                        {day.date.slice(5)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* System Menu */}
                <div className="retro-window" style={{ flex: 1, minWidth: '200px' }}>
                    <h3 style={{ color: 'white', marginBottom: '16px' }}>CONTROLS</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <a href="/admin/issues" className="button-primary" style={{ textAlign: 'center', fontSize: '12px' }}>
                            MANAGE_CHALLENGES
                        </a>
                        <a href="/admin/usage" className="button-primary" style={{ textAlign: 'center', fontSize: '12px', background: '#7c3aed', borderColor: '#6d28d9' }}>
                            USAGE_METRICS
                        </a>
                        <a href="/admin/submissions" className="button-secondary" style={{ textAlign: 'center', fontSize: '12px', background: '#333', color: '#fff' }}>
                            VIEW_RAW_LOGS
                        </a>
                    </div>
                </div>

            </div>

            {/* Bottom Row: User Table */}
            <div className="retro-window" style={{ marginTop: '24px' }}>
                <h3 style={{ color: 'white', marginBottom: '16px' }}>NODE_LIST (ACTIVE USERS)</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: '#ccc', fontFamily: 'monospace' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #333', textAlign: 'left' }}>
                                <th style={{ padding: '8px', color: '#DC2626' }}>USER_ID</th>
                                <th style={{ padding: '8px', color: '#DC2626' }}>TOTAL_SUBMITS</th>
                                <th style={{ padding: '8px', color: '#DC2626' }}>LAST_ACTIVE</th>
                                <th style={{ padding: '8px', color: '#DC2626' }}>RISK_SCORE</th>
                                <th style={{ padding: '8px', color: '#DC2626' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.userStats?.map((u: any) => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #222', opacity: u.isBanned ? 0.5 : 1 }}>
                                    <td style={{ padding: '8px' }}>
                                        <a href={`/admin/submissions?userId=${u.id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: u.isBanned ? '#ef4444' : 'inherit' }} title="View Submissions">
                                            {u.image && <img src={u.image} style={{ width: '20px', height: '20px', borderRadius: '50%', filter: u.isBanned ? 'grayscale(100%)' : 'none' }} />}
                                            <span style={{ textDecoration: u.isBanned ? 'line-through' : 'underline', textDecorationStyle: 'dotted' }}>{u.name || u.email}</span>
                                            {u.isBanned && <span style={{ fontSize: '10px', background: '#DC2626', color: 'white', padding: '2px 4px', borderRadius: '2px' }}>BANNED</span>}
                                        </a>
                                    </td>
                                    <td style={{ padding: '8px' }}>{u.totalSubmissions}</td>
                                    <td style={{ padding: '8px' }}>{u.lastActive ? new Date(u.lastActive).toLocaleDateString() : 'N/A'}</td>
                                    <td style={{ padding: '8px' }}>
                                        <span style={{
                                            color: u.riskScore > 80 ? '#ef4444' : u.riskScore > 50 ? '#eab308' : '#22c55e',
                                            fontWeight: 'bold'
                                        }}>
                                            {u.riskScore}%
                                        </span>
                                    </td>
                                    <td style={{ padding: '8px' }}>
                                        <button
                                            onClick={() => handleBan(u.id)}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid #333',
                                                color: u.isBanned ? '#22c55e' : '#DC2626',
                                                cursor: 'pointer',
                                                fontSize: '10px',
                                                padding: '4px 8px'
                                            }}
                                        >
                                            {u.isBanned ? 'UNBAN' : 'BAN'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(!stats?.userStats || stats.userStats.length === 0) && (
                                <tr>
                                    <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                                        NO_ACTIVE_NODES_DETECTED
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
