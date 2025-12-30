'use client';

import { useState } from 'react';
import { toggleBanUser } from '@/app/actions/user-management';

export default function UserProfileActions({ userId, isBanned: initialStatus }: { userId: string, isBanned: boolean }) {
    const [isBanned, setIsBanned] = useState(initialStatus);
    const [loading, setLoading] = useState(false);

    const handleBan = async () => {
        if (!confirm(`Are you sure you want to ${isBanned ? 'UNBAN' : 'BAN'} this user?`)) return;
        setLoading(true);
        try {
            const res = await toggleBanUser(userId);
            if (res.success) {
                setIsBanned(res.isBanned);
            }
        } catch (e) {
            alert('Action failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleBan}
            disabled={loading}
            style={{
                background: isBanned ? '#22c55e' : '#DC2626',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                opacity: loading ? 0.7 : 1
            }}
        >
            {loading ? 'PROCESSING...' : isBanned ? 'UNBAN_USER' : 'BAN_USER'}
        </button>
    );
}
