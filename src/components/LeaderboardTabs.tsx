'use client';

import { useState, useEffect } from 'react';

export default function LeaderboardTabs({ regularUsers: initialRegular, semester1Users: initialSem1, styles }: any) {
    const [activeTab, setActiveTab] = useState<'regular' | 'sem1'>('regular');

    // Initial State from Server
    const [regularUsers, setRegularUsers] = useState(initialRegular);
    const [semester1Users, setSem1Users] = useState(initialSem1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const poll = async () => {
            try {
                // setLoading(true); // Don't flicker loading on poll, silent update
                const res = await fetch('/api/stats');
                const data = await res.json();
                if (data.regular) setRegularUsers(data.regular);
                if (data.freshers) setSem1Users(data.freshers);
            } catch (e) {
                console.error("Leaderboard poll error", e);
            }
        };

        const interval = setInterval(poll, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const users = activeTab === 'regular' ? regularUsers : semester1Users;

    return (
        <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <button
                    onClick={() => setActiveTab('regular')}
                    style={{
                        background: activeTab === 'regular' ? '#DC2626' : '#222',
                        color: 'white',
                        border: '4px solid white',
                        padding: '12px 24px',
                        borderRadius: '0',
                        fontFamily: '"Press Start 2P"',
                        fontSize: '10px',
                        boxShadow: activeTab === 'regular' ? '4px 4px 0px #fff' : 'none',
                        cursor: 'pointer'
                    }}
                >
                    SENIOR_ARENA
                </button>
                <button
                    onClick={() => setActiveTab('sem1')}
                    style={{
                        background: activeTab === 'sem1' ? '#DC2626' : '#222',
                        color: 'white',
                        border: '4px solid white',
                        padding: '12px 24px',
                        borderRadius: '0',
                        fontFamily: '"Press Start 2P"',
                        fontSize: '10px',
                        boxShadow: activeTab === 'sem1' ? '4px 4px 0px #fff' : 'none',
                        cursor: 'pointer'
                    }}
                >
                    FRESHER_GAUNTLET
                </button>
            </div>

            <div className="retro-window" style={{ background: '#000', padding: '0' }}>
                {users.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', fontFamily: '"Share Tech Mono"', color: '#666' }}>NO_DATA_AVAILABLE</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Share Tech Mono"', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid white', background: '#111' }}>
                                <th style={{ padding: '16px', textAlign: 'left', color: '#DC2626' }}>RANK</th>
                                <th style={{ padding: '16px', textAlign: 'left', color: '#DC2626' }}>USER_HANDLE</th>
                                <th style={{ padding: '16px', textAlign: 'right', color: '#DC2626' }}>SCORE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user: any, index: number) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #333' }}>
                                    <td style={{ padding: '16px', color: index < 3 ? '#FFD700' : 'white' }}>
                                        {index === 0 && '👑 '}
                                        #{index + 1}
                                    </td>
                                    <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {user.image ? (
                                            <img src={user.image} style={{ width: 32, height: 32, border: '2px solid #555' }} alt="" />
                                        ) : (
                                            <div style={{ width: 32, height: 32, background: '#333', border: '2px solid #555' }} />
                                        )}
                                        <span style={{ color: 'white', fontWeight: 'bold' }}>{user.name || 'ANONYMOUS'}</span>
                                        {user.semester === 1 && activeTab === 'sem1' && <span style={{ fontSize: '10px', background: '#333', padding: '2px 4px', border: '1px solid #555' }}>LVL 1</span>}
                                        {/* Rank Change Indicator - Only show if user belongs to this tab */}
                                        {user.lastRank && (
                                            (activeTab === 'sem1' && user.semester === 1) || (activeTab === 'regular' && user.semester !== 1)
                                        ) && (
                                                <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                                                    {user.lastRank > index + 1 ? (
                                                        <span style={{ color: '#0f0' }}>▲{user.lastRank - (index + 1)}</span>
                                                    ) : user.lastRank < index + 1 ? (
                                                        <span style={{ color: '#f00' }}>▼{(index + 1) - user.lastRank}</span>
                                                    ) : (
                                                        <span style={{ color: '#555' }}>━</span>
                                                    )}
                                                </span>
                                            )}
                                        {!user.lastRank && <span style={{ marginLeft: '8px', fontSize: '10px', color: '#888' }}>NEW</span>}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontFamily: '"Press Start 2P"', fontSize: '10px', color: '#0f0' }}>
                                        {user.score} PPS
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div style={{ marginTop: '16px', textAlign: 'right', fontSize: '10px', color: '#555', fontFamily: '"Share Tech Mono"' }}>
                LIVE_FEED_ACTIVE • REFRESHING_EVERY_10S
            </div>
        </div>
    );
}
