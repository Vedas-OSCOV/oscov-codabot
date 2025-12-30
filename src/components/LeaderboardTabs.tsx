'use client';

import { useState } from 'react';

export default function LeaderboardTabs({ regularUsers, semester1Users, styles }: any) {
    const [activeTab, setActiveTab] = useState<'regular' | 'sem1'>('regular');

    const users = activeTab === 'regular' ? regularUsers : semester1Users;

    return (
        <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <button
                    onClick={() => setActiveTab('regular')}
                    style={{
                        background: activeTab === 'regular' ? '#0071e3' : 'rgba(0,0,0,0.05)',
                        color: activeTab === 'regular' ? 'white' : '#666',
                        border: 'none',
                        padding: '8px 24px',
                        borderRadius: '99px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Project Contributors
                </button>
                <button
                    onClick={() => setActiveTab('sem1')}
                    style={{
                        background: activeTab === 'sem1' ? '#0071e3' : 'rgba(0,0,0,0.05)',
                        color: activeTab === 'sem1' ? 'white' : '#666',
                        border: 'none',
                        padding: '8px 24px',
                        borderRadius: '99px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Semester 1 (Freshers)
                </button>
            </div>

            <div className={styles.list}>
                {users.length === 0 ? (
                    <div className={styles.emptyState}>No rankings available yet.</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>#</th>
                                <th>User</th>
                                <th style={{ textAlign: 'right' }}>Total Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user: any, index: number) => (
                                <tr key={user.id} className={index < 3 ? styles.topRow : styles.row}>
                                    <td className={styles.rank}>{index + 1}</td>
                                    <td className={styles.userCell}>
                                        {user.image && <img src={user.image} className={styles.avatar} alt="" />}
                                        <span className={styles.username}>{user.name || 'Anonymous'}</span>
                                        {index === 0 && <span className={styles.crown}>👑</span>}
                                        {user.semester === 1 && activeTab === 'sem1' && <span style={{ fontSize: '10px', marginLeft: '8px', background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>Fresher</span>}
                                    </td>
                                    <td className={styles.points}>{user.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
