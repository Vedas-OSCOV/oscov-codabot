import { getMonitoringStats } from '@/app/actions/admin-insights';

export const dynamic = 'force-dynamic';

export default async function MonitoringPage() {
    const stats = await getMonitoringStats();

    // Find max for heatmap scaling
    const maxHeat = Math.max(...stats.heatmap, 1);

    return (
        <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', color: '#fff', fontFamily: '"Share Tech Mono", monospace' }}>
            <div style={{ marginBottom: '30px', borderBottom: '2px solid #DC2626', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '32px', margin: 0, color: '#DC2626', textShadow: '2px 2px 0px #fff' }}>DEEP_DIVE_MONITOR</h1>
                    <p style={{ margin: '8px 0 0 0', color: '#888' }}>Behavioral Analytics & System Health</p>
                </div>
                <a href="/admin" className="button-secondary" style={{ border: '1px solid #666', padding: '8px 16px', textDecoration: 'none', color: '#ccc' }}>&lt; RETURN_ROOT</a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', gap: '30px' }}>

                {/* 1. Temporal Heatmap */}
                <div className="retro-window" style={{ gridColumn: '1 / -1', background: '#000', border: '1px solid #333', padding: '24px' }}>
                    <h3 style={{ color: '#fff', marginBottom: '20px' }}>TEMPORAL_HEATMAP (24H ACTIVITY)</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '120px', gap: '4px' }}>
                        {stats.heatmap.map((count: number, hour: number) => {
                            const height = Math.max((count / maxHeat) * 100, 5);
                            return (
                                <div key={hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }} title={`${hour}:00 - ${count} submissions`}>
                                    <div style={{ width: '100%', height: `${height}%`, background: count > 0 ? '#22c55e' : '#111', opacity: count > 0 ? 0.8 : 0.3 }}></div>
                                    <span style={{ fontSize: '10px', color: '#444' }}>{hour}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Challenge Matrix */}
                <div className="retro-window" style={{ background: '#000', border: '1px solid #333', padding: '24px', height: '500px', overflowY: 'auto' }}>
                    <h3 style={{ color: '#fff', marginBottom: '20px' }}>DIFFICULTY_MATRIX</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #333', color: '#888' }}>
                                <th style={{ padding: '8px' }}>CHALLENGE</th>
                                <th style={{ padding: '8px' }}>ATTEMPTS</th>
                                <th style={{ padding: '8px' }}>FAILURES</th>
                                <th style={{ padding: '8px' }}>PASS_RATE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.matrix.map((item: any, i: number) => (
                                <tr key={i} style={{ borderBottom: '1px solid #111' }}>
                                    <td style={{ padding: '8px', color: '#fff' }}>{item.title}</td>
                                    <td style={{ padding: '8px', color: '#aaa' }}>{item.attempts}</td>
                                    <td style={{ padding: '8px', color: '#ef4444' }}>{item.fails}</td>
                                    <td style={{ padding: '8px' }}>
                                        <div style={{
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            background: item.passRate < 30 ? '#ef4444' : item.passRate < 70 ? '#eab308' : '#22c55e',
                                            color: '#000',
                                            display: 'inline-block',
                                            fontWeight: 'bold'
                                        }}>
                                            {item.passRate}%
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 3. Anomalies & Live Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                    {/* Anomalies */}
                    <div className="retro-window" style={{ background: '#000', border: '1px solid #333', padding: '24px' }}>
                        <h3 style={{ color: '#fff', marginBottom: '20px' }}>ANOMALY_DETECTION</h3>
                        {stats.anomalies.length === 0 ? (
                            <div style={{ color: '#22c55e', padding: '10px', border: '1px dashed #22c55e' }}>SYSTEM_NOMINAL: No irregularities detected.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {stats.anomalies.map((a: any, i: number) => (
                                    <div key={i} style={{ padding: '12px', border: '1px solid #DC2626', background: 'rgba(220, 38, 38, 0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ fontSize: '20px' }}>⚠️</div>
                                        <div>
                                            <div style={{ color: '#DC2626', fontWeight: 'bold' }}>{a.type}</div>
                                            <div style={{ fontSize: '12px', color: '#ccc' }}>
                                                {a.user.name} ({a.user.email}) - {a.details}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Live Feed */}
                    <div className="retro-window" style={{ background: '#000', border: '1px solid #333', padding: '24px', flex: 1, overflowY: 'auto', maxHeight: '300px' }}>
                        <h3 style={{ color: '#fff', marginBottom: '20px' }}>LIVE_EVENT_BUS</h3>
                        <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                            {stats.logs.map((log: any) => (
                                <div key={log.id} style={{ marginBottom: '8px', borderBottom: '1px solid #111', paddingBottom: '4px', display: 'flex', gap: '8px' }}>
                                    <span style={{ color: '#666' }}>[{new Date(log.createdAt).toLocaleTimeString()}]</span>
                                    <span style={{ color: log.status === 'APPROVED' ? '#22c55e' : log.status === 'REJECTED' ? '#ef4444' : '#eab308' }}>
                                        {log.status.padEnd(8)}
                                    </span>
                                    <span style={{ color: '#ccc' }}>{log.user.name}</span>
                                    <span style={{ color: '#888' }}>&gt;</span>
                                    <span style={{ color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {log.challenge?.title || log.issue?.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
