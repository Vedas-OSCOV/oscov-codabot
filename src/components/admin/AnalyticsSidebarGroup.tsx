'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/app/admin/admin-layout.module.css';

export default function AnalyticsSidebarGroup() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const isActive = pathname.startsWith('/admin/analytics');

    // Auto-expand if active
    if (isActive && !isOpen) {
        setIsOpen(true);
    }

    const toggle = () => setIsOpen(!isOpen);

    const items = [
        { name: "Event Health", href: "/admin/analytics/event-health" },
        { name: "Time Behavior", href: "/admin/analytics/time-behavior" },
        { name: "Funnel Autopsy", href: "/admin/analytics/funnel-autopsy" },
        { name: "Problem Post-mortem", href: "/admin/analytics/problem-post-mortem" },
        { name: "Difficulty Curve", href: "/admin/analytics/difficulty-curve" },
        { name: "Leaderboard Audit", href: "/admin/analytics/leaderboard-integrity" },
        { name: "Language Insights", href: "/admin/analytics/language-insights" },
        { name: "Retention", href: "/admin/analytics/retention" },
        { name: "Reward Economics", href: "/admin/analytics/reward-economics" },
        { name: "System Reliability", href: "/admin/analytics/system-reliability" },
        { name: "Cohort Comparisons", href: "/admin/analytics/cohorts" },
        { name: "Final Insights", href: "/admin/analytics/final-insights" },
    ];

    return (
        <div className={styles.group}>
            <button onClick={toggle} className={`${styles.link} ${styles.groupTrigger} ${isActive ? styles.active : ''}`}>
                <span className={styles.icon}>📊</span>
                Post Analytics
                <span className={styles.chevron}>{isOpen ? '▼' : '▶'}</span>
            </button>
            {isOpen && (
                <div className={styles.subnav}>
                    {items.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.sublink} ${pathname === item.href ? styles.activeSub : ''}`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
