
/**
 * Game Configuration
 * 
 * Defines global constants for the game timeline.
 */

// 11:00 AM on January 2nd, 2026 (Nepal Time - UTC+5:45)
export const GAME_OVER_TIMESTAMP = '2026-01-02T12:00:00+05:45';

export function isGameOver(): boolean {
    const now = new Date();
    const gameOverTime = new Date(GAME_OVER_TIMESTAMP);
    return now.getTime() >= gameOverTime.getTime();
}
