/**
 * Frenzy Mode Utility
 * 
 * Frenzy Mode activates daily from 10:00 PM to 11:59 PM Nepal Time (NPT, UTC+5:45)
 * Benefits:
 * - 2x points for senior students
 * - Reduced rate limit to 2 minutes (from 5 minutes)
 */

export function getNepalTimeComponents(): { hour: number; minute: number } {
    const now = new Date();
    const nepalOffsetMs = (5 * 60 + 45) * 60 * 1000;
    const nepalTimeMs = now.getTime() + nepalOffsetMs;
    const nepalDate = new Date(nepalTimeMs);

    return {
        hour: nepalDate.getUTCHours(),
        minute: nepalDate.getUTCMinutes()
    };
}

export function isFrenzyMode(): boolean {
    const { hour } = getNepalTimeComponents();
    return hour >= 22 || hour < 11;
}

export function getRateLimit(): number {
    return isFrenzyMode() ? 2 * 60 * 1000 : 5 * 60 * 1000;
}

export function getPointsMultiplier(isSenior: boolean): number {
    return isFrenzyMode() && isSenior ? 2 : 1;
}

export function getFrenzyStatus(): {
    isActive: boolean;
    message: string;
    nepalTime: string;
} {
    const { hour, minute } = getNepalTimeComponents();
    const isActive = hour >= 22 || hour < 11;

    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    if (isActive) {
        return {
            isActive: true,
            message: '🔥 FRENZY MODE ACTIVE!(Ends at 11:00 AM) 2x points for seniors & 2-min rate limit for everyone',
            nepalTime: timeString
        };
    } else {
        const minutesUntilFrenzy = (22 - hour - 1) * 60 + (60 - minute);
        const hoursUntil = Math.floor(minutesUntilFrenzy / 60);
        const minsUntil = minutesUntilFrenzy % 60;

        return {
            isActive: false,
            message: `Frenzy Mode starts at 10:00 PM NPT (${hoursUntil}h ${minsUntil}m remaining)`,
            nepalTime: timeString
        };
    }
}
