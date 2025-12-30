import { getUserDeepStats } from '@/app/actions/user-management';
import UserProfileActions from './actions';

export const dynamic = 'force-dynamic';

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getUserDeepStats(id);

    if (!data) return <div style={{ padding: '40px', color: 'red' }}>USER_NOT_FOUND</div>;
    const { user, stats } = data;

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: '#fff', fontFamily: '"Share Tech Mono", monospace' }}>
            {/* Header */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '40px', borderBottom: '2px solid #333', paddingBottom: '24px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${user.isBanned ? '#DC2626' : '#22c55e'}` }}>
                    {user.image ? <img src={user.image} style={{ width: '100%', height: '100%' }} /> : <div style={{ background: '#333', width: '100%', height: '100%' }} />}
                </div>
                <div>
                    <h1 style={{ margin: 0, color: user.isBanned ? '#DC2626' : '#fff', textDecoration: user.isBanned ? 'line-through' : 'none' }}>
                        {user.name}
                        {user.isBanned && <span style={{ fontSize: '14px', marginLeft: '12px', background: '#DC2626', color: 'white', padding: '4px 8px', textDecoration: 'none', borderRadius: '4px' }}>BANNED</span>}
                    </h1>
                    <p style={{ margin: '8px 0', color: '#888' }}>ID: {user.id} | Email: {user.email}</p>
                    <p style={{ margin: '0', color: '#666', fontSize: '12px' }}>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    <UserProfileActions userId={user.id} isBanned={user.isBanned} />
                </div>
            </div>

            {/* Stats Gird */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div className="retro-window" style={{ background: '#111', padding: '20px', border: '1px solid #333' }}>
                    <h4 style={{ color: '#888', margin: '0 0 10px 0' }}>TOTAL_SUBMISSIONS</h4>
                    <span style={{ fontSize: '24px', color: '#fff' }}>{stats.totalSubmissions}</span>
                </div>
                <div className="retro-window" style={{ background: '#111', padding: '20px', border: '1px solid #333' }}>
                    <h4 style={{ color: '#888', margin: '0 0 10px 0' }}>PASS_RATE</h4>
                    <span style={{ fontSize: '24px', color: stats.passRate > 70 ? '#22c55e' : stats.passRate > 30 ? '#eab308' : '#DC2626' }}>{stats.passRate}%</span>
                </div>
                <div className="retro-window" style={{ background: '#111', padding: '20px', border: '1px solid #333' }}>
                    <h4 style={{ color: '#888', margin: '0 0 10px 0' }}>EST_COST</h4>
                    <span style={{ fontSize: '24px', color: '#fbbf24' }}>${stats.estCost.toFixed(3)}</span>
                </div>
                <div className="retro-window" style={{ background: '#111', padding: '20px', border: '1px solid #333' }}>
                    <h4 style={{ color: '#888', margin: '0 0 10px 0' }}>RAPID_FIRE_ALERTS</h4>
                    <span style={{ fontSize: '24px', color: stats.rapidFireEvents > 0 ? '#DC2626' : '#22c55e' }}>{stats.rapidFireEvents} EVENTS</span>
                </div>
            </div>

            {/* Submission Log */}
            <div className="retro-window" style={{ background: '#000', border: '1px solid #333', padding: '24px' }}>
                <h3 style={{ color: '#fff', marginBottom: '20px' }}>ACTIVITY_LOG (LAST 100)</h3>
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#000' }}>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #333', color: '#666' }}>
                                <th style={{ padding: '8px' }}>DATE</th>
                                <th style={{ padding: '8px' }}>CHALLENGE</th>
                                <th style={{ padding: '8px' }}>STATUS</th>
                                <th style={{ padding: '8px' }}>SCORE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {user.submissions.map((sub: any) => (
                                <tr key={sub.id} style={{ borderBottom: '1px solid #111' }}>
                                    <td style={{ padding: '8px', color: '#888' }}>{new Date(sub.createdAt).toLocaleString()}</td>
                                    <td style={{ padding: '8px', color: '#fff' }}>{sub.challenge?.title || sub.issue?.title || 'Unknown'}</td>
                                    <td style={{ padding: '8px', fontWeight: 'bold', color: sub.status === 'APPROVED' ? '#22c55e' : sub.status === 'REJECTED' ? '#DC2626' : '#eab308' }}>
                                        {sub.status}
                                    </td>
                                    <td style={{ padding: '8px', color: '#ccc' }}>{sub.aiScore}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
