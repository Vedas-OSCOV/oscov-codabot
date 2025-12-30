import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function UsagePage() {
    const topConsumers = await prisma.user.findMany({
        take: 20,
        orderBy: {
            submissions: {
                _count: 'desc'
            }
        },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            _count: {
                select: { submissions: true }
            }
        }
    });

    const maxSubmissions = Math.max(...topConsumers.map(u => u._count.submissions), 1);

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', color: '#fff', fontFamily: '"Share Tech Mono", monospace' }}>
            <div style={{ marginBottom: '40px', borderBottom: '2px solid #DC2626', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '32px', margin: 0, color: '#DC2626', textShadow: '2px 2px 0px #fff' }}>RESOURCE_MONITOR</h1>
                    <p style={{ margin: '8px 0 0 0', color: '#888' }}>Top API Consumers & Compute Usage</p>
                </div>
                <a href="/admin" className="button-secondary" style={{ border: '1px solid #666', padding: '8px 16px', textDecoration: 'none', color: '#ccc' }}>&lt; RETURN_ROOT</a>
            </div>

            <div className="retro-window" style={{ background: '#000', border: '1px solid #333', padding: '32px' }}>
                <h3 style={{ color: '#fff', marginBottom: '40px', textAlign: 'center' }}>COMPUTE_INTENSITY_GRAPH (TOP 20 NODES)</h3>

                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    height: '400px',
                    gap: '20px',
                    padding: '20px',
                    borderLeft: '2px solid #333',
                    borderBottom: '2px solid #333',
                    overflowX: 'auto'
                }}>
                    {topConsumers.map(user => {
                        const count = user._count.submissions;
                        const height = Math.max((count / maxSubmissions) * 100, 2); // min 2%

                        return (
                            <div key={user.id} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                flex: '0 0 60px',
                                height: '100%',
                                justifyContent: 'flex-end'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: `${height}%`,
                                    background: 'linear-gradient(to top, #DC2626, #ef4444)',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'center',
                                    paddingTop: '8px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    textShadow: '1px 1px 0 #000',
                                    borderTopLeftRadius: '4px',
                                    borderTopRightRadius: '4px',
                                    transition: 'height 0.3s ease'
                                }}>
                                    {count}
                                </div>

                                <div style={{ marginTop: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        border: '2px solid #333',
                                        background: '#111'
                                    }}>
                                        {user.image ? (
                                            <img src={user.image} alt={user.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '10px' }}>N/A</div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#888', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '100px', textAlign: 'left' }}>
                                        <a href={`/admin/users/${user.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                            {user.name || user.email}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ marginTop: '40px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
                LIVE_DATA_STREAM // REFRESH_RATE: DYNAMIC
            </div>
        </div>
    );
}
