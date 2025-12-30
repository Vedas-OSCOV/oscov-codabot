'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface Challenge {
    id: string;
    title: string;
    description: string;
    points: number;
    difficulty: string;
}

interface SubmissionMap {
    [key: string]: {
        status: string;
    };
}

interface ChallengeListProps {
    initialChallenges: Challenge[];
    submissionMap: SubmissionMap;
}

export default function ChallengeList({ initialChallenges, submissionMap }: ChallengeListProps) {
    const [minPoints, setMinPoints] = useState<number | ''>('');
    const [maxPoints, setMaxPoints] = useState<number | ''>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const filteredChallenges = useMemo(() => {
        let result = [...initialChallenges];

        if (minPoints !== '') {
            result = result.filter(c => c.points >= minPoints);
        }
        if (maxPoints !== '') {
            result = result.filter(c => c.points <= maxPoints);
        }

        result.sort((a, b) => {
            if (sortOrder === 'asc') return a.points - b.points;
            return b.points - a.points;
        });

        return result;
    }, [initialChallenges, minPoints, maxPoints, sortOrder]);

    return (
        <div>
            {/* Filter Bar */}
            <div className="retro-window" style={{ marginBottom: '32px', padding: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-end', background: '#000' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: '#fff', fontSize: '12px', fontFamily: '"Press Start 2P"' }}>MIN_PTS</label>
                    <input
                        type="number"
                        value={minPoints}
                        onChange={(e) => setMinPoints(e.target.value ? Number(e.target.value) : '')}
                        style={{ width: '100px', background: '#000', color: '#fff', border: '2px solid #fff', padding: '8px', fontFamily: '"Share Tech Mono"' }}
                        placeholder="0"
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: '#fff', fontSize: '12px', fontFamily: '"Press Start 2P"' }}>MAX_PTS</label>
                    <input
                        type="number"
                        value={maxPoints}
                        onChange={(e) => setMaxPoints(e.target.value ? Number(e.target.value) : '')}
                        style={{ width: '100px', background: '#000', color: '#fff', border: '2px solid #fff', padding: '8px', fontFamily: '"Share Tech Mono"' }}
                        placeholder="1000"
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ color: '#fff', fontSize: '12px', fontFamily: '"Press Start 2P"' }}>ORDER</label>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                        style={{ width: '150px', background: '#000', color: '#fff', border: '2px solid #fff', padding: '8px', fontFamily: '"Share Tech Mono"', height: '40px' }}
                    >
                        <option value="desc">HIGHEST_FIRST</option>
                        <option value="asc">LOWEST_FIRST</option>
                    </select>
                </div>
                <div style={{ marginLeft: 'auto', color: '#888', fontSize: '12px', fontFamily: '"Share Tech Mono"', alignSelf: 'center' }}>
                    SHOWING {filteredChallenges.length} RECORDS
                </div>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {filteredChallenges.length > 0 ? filteredChallenges.map(challenge => {
                    const sub = submissionMap[challenge.id];
                    const isSolved = sub?.status === 'APPROVED';
                    const isPending = sub?.status === 'PENDING_AI';

                    return (
                        <Link href={`/challenges/${challenge.id}`} key={challenge.id} className="retro-window" style={{
                            display: 'block',
                            padding: '24px',
                            transition: 'transform 0.1s',
                            position: 'relative',
                            opacity: isSolved ? 0.6 : 1,
                            textDecoration: 'none'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <span style={{
                                    fontSize: '10px', padding: '4px 8px',
                                    background: '#fff', color: '#000', fontFamily: '"Press Start 2P"'
                                }}>
                                    {challenge.points} PTS
                                </span>
                                {sub && (
                                    <span style={{
                                        fontSize: '10px',
                                        color: isSolved ? '#0f0' : isPending ? '#fbbf24' : '#DC2626',
                                        fontFamily: '"Share Tech Mono"'
                                    }}>
                                        [{sub.status}]
                                    </span>
                                )}
                            </div>
                            <h3 style={{ fontSize: '16px', marginBottom: '12px', lineHeight: '1.4', color: '#fff', textTransform: 'uppercase' }}>{challenge.title}</h3>
                            <p style={{ fontSize: '14px', color: '#888', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', fontFamily: '"Share Tech Mono"' }}>
                                {challenge.description}
                            </p>
                        </Link>
                    );
                }) : (
                    <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#666', border: '2px dashed #444' }}>
                        <h3>NO_MATCHES_FOUND.</h3>
                        <p>ADJUST_FILTERS.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
