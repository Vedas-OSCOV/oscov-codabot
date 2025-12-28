'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await signIn('credentials', {
            username,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid Admin Credentials");
        } else {
            router.push('/admin');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: 'white' }}>
            <div style={{ padding: '48px', width: '100%', maxWidth: '400px', border: '1px solid #333', borderRadius: '24px', background: '#000' }}>
                <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', letterSpacing: '-0.02em' }}>Admin Control Center</h1>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '8px' }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: 'white', outline: 'none' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '8px' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: 'white', outline: 'none' }}
                        />
                    </div>

                    {error && <div style={{ color: '#ff3b30', fontSize: '14px' }}>{error}</div>}

                    <button
                        type="submit"
                        style={{ marginTop: '8px', padding: '12px', background: 'white', color: 'black', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                    >
                        Enter
                    </button>
                </form>
            </div>
        </div>
    );
}
