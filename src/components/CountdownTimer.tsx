'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
    targetDate: string; // ISO String
    label?: string;
}

export default function CountdownTimer({ targetDate, label = "CODE-ATHON ENDS IN" }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
        isExpired: boolean;
    } | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();

            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                    isExpired: false
                };
            } else {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
            }
        };

        // Initial set
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    // Avoid hydration mismatch by waiting for client-side calc
    if (!timeLeft) return null;

    if (timeLeft.isExpired) {
        return (
            <div className="retro-window" style={{
                padding: '12px 24px',
                textAlign: 'center',
                background: '#DC2626',
                color: '#fff',
                marginBottom: '24px',
                border: '2px solid #fff'
            }}>
                <span style={{ fontFamily: '"Press Start 2P"', fontSize: '12px' }}>EVENT ENDED</span>
            </div>
        );
    }

    return (
        <div className="retro-window" style={{
            padding: '16px 24px',
            textAlign: 'center',
            marginBottom: '32px',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '2px solid #0f0',
            boxShadow: '0 0 10px rgba(0, 255, 0, 0.2)'
        }}>
            {label && <div style={{
                color: '#0f0',
                fontFamily: '"Press Start 2P"',
                fontSize: '10px',
                marginBottom: '12px'
            }}>{label}</div>}

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '24px',
                fontFamily: '"Press Start 2P"',
                color: '#fff'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px', color: '#fff', textShadow: '2px 2px #DC2626' }}>
                        {timeLeft.days.toString().padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>DAYS</span>
                </div>
                <div style={{ fontSize: '20px', color: '#666' }}>:</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px', color: '#fff', textShadow: '2px 2px #DC2626' }}>
                        {timeLeft.hours.toString().padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>HRS</span>
                </div>
                <div style={{ fontSize: '20px', color: '#666' }}>:</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px', color: '#fff', textShadow: '2px 2px #DC2626' }}>
                        {timeLeft.minutes.toString().padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>MIN</span>
                </div>
                <div style={{ fontSize: '20px', color: '#666' }}>:</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px', color: '#fff', textShadow: '2px 2px #DC2626' }}>
                        {timeLeft.seconds.toString().padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>SEC</span>
                </div>
            </div>
        </div>
    );
}
