"use client";

import { useEffect, useState } from 'react';
import styles from './admin-page.module.css';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/stats');
                const data = await res.json();
                setStats(data.stats);
            } catch (e) {
                console.error("Polling error", e);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 5000); // Poll every 5s

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.container}>

            <div className={styles.header}>
                <h1 className={styles.title} style={{ color: '#DC2626', textShadow: '2px 2px white' }}>ADMIN_ROOT</h1>
                <p className={styles.date} style={{ fontFamily: '"Share Tech Mono"', color: '#fff' }}>SYSTEM STATUS: ONLINE</p>
                {loading && <span style={{ color: '#0f0', fontSize: '10px' }}>[SYNCING...]</span>}
            </div>

            <div className={styles.grid}>
                <div className="retro-window" style={{ flex: 1 }}>
                    <h3 className={styles.cardTitle} style={{ color: '#fff' }}>ISSUES_DB</h3>
                    <p className={styles.cardDesc}>Manage Challenge Set</p>
                    <a href="/admin/issues" className="button-primary" style={{ display: 'inline-block', marginTop: '16px', fontSize: '10px' }}>
                        INJECT_ISSUE
                    </a>
                </div>

                <div className="retro-window" style={{ flex: 1 }}>
                    <h3 className={styles.cardTitle} style={{ color: '#fff' }}>QUEUE_DEPTH</h3>
                    <p className={styles.bigNumber} style={{ color: '#DC2626', textShadow: '2px 2px 0px white' }}>
                        {stats?.totalSubmissions || 0}
                    </p>
                    <p className={styles.cardDesc}>Total Submissions</p>
                </div>

                <div className="retro-window" style={{ flex: 1 }}>
                    <h3 className={styles.cardTitle} style={{ color: '#fff' }}>NETWORK_TRAFFIC</h3>
                    <div className={styles.statRow} style={{ borderBottom: '1px dashed #555' }}>
                        <span>ACTIVE_NODES</span>
                        <span style={{ color: '#0f0' }}>{stats?.activeUsers || 0}</span>
                    </div>
                </div>
            </div>

            <div className="retro-window" style={{ marginTop: '24px' }}>
                <h3 style={{ color: 'white', marginBottom: '16px' }}>SYSTEM_LOGS</h3>
                <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#0f0', background: '#000', padding: '12px', height: '150px', overflow: 'hidden' }}>
                    &gt; Polling /api/stats... OK<br />
                    &gt; Verify Integrity... OK<br />
                    &gt; AI_JUDGE: LISTENING<br />
                    {stats && <span>&gt; UPDATE_RX: {new Date().toLocaleTimeString()}</span>}
                </div>
            </div>

        </div>
    );
}
