'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
                padding: '8px 16px',
                background: 'rgba(0,0,0,0.05)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
        >
            Sign Out
        </button>
    );
}
