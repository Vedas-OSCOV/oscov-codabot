/**
 * Frenzy Mode Utility
 * 
 * Frenzy Mode activates daily from 10:00 PM to 11:59 PM Nepal Time (NPT, UTC+5:45)
 * Benefits:
 * - 2x points for senior students
 * - Reduced rate limit to 2 minutes (from 5 minutes)
 */

export function isFrenzyMode(): boolean {
    // Get current time in Nepal timezone (UTC+5:45)
    const now = new Date();

    // Nepal is UTC+5:45, which is 345 minutes ahead of UTC
    const nepalOffset = 345; // minutes
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const nepalTime = new Date(utcTime + (nepalOffset * 60000));

    const hour = nepalTime.getHours();

    // Frenzy mode is active from 22:00 (10 PM) to 23:59 (11:59 PM)
    return hour >= 22;
}

export function getRateLimit(): number {
    // 2 minutes during frenzy, 5 minutes otherwise
    return isFrenzyMode() ? 2 * 60 * 1000 : 5 * 60 * 1000;
}

export function getPointsMultiplier(isSenior: boolean): number {
    // 2x for seniors during frenzy, 1x otherwise
    return isFrenzyMode() && isSenior ? 2 : 1;
}

export function getFrenzyStatus(): {
    isActive: boolean;
    message: string;
    nepalTime: string;
} {
    const now = new Date();
    const nepalOffset = 345;
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const nepalTime = new Date(utcTime + (nepalOffset * 60000));

    const hour = nepalTime.getHours();
    const minute = nepalTime.getMinutes();
    const isActive = hour >= 22;

    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    if (isActive) {
        return {
            isActive: true,
            message: '🔥 FRENZY MODE ACTIVE! 2x points for seniors & 2-min rate limit for all!',
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
