'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getUserDataset() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    // Fetch all submissions for granular behavioral analysis
    const submissions = await prisma.submission.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    semester: true,
                    isBanned: true
                }
            },
            challenge: {
                select: {
                    title: true,
                    difficulty: true,
                    points: true
                }
            },
            issue: {
                select: {
                    title: true,
                    basePoints: true
                }
            }
        }
    });

    // Process data into flat format for CSV
    return submissions.map(s => {
        // Determine problem context
        const problemType = s.challengeId ? 'CHALLENGE' : s.issueId ? 'ISSUE' : 'UNKNOWN';
        const problemTitle = s.challenge?.title || s.issue?.title || 'Unknown';
        const difficulty = s.challenge?.difficulty || 'N/A';
        const maxPoints = s.challenge?.points || s.issue?.basePoints || 0;

        return {
            submission_id: s.id,
            timestamp: s.createdAt.toISOString(),
            user_id: s.user?.id || 'deleted',
            user_name: s.user?.name || 'Anonymous',
            user_email: s.user?.email || 'No Email',
            semester: s.user?.semester || 'N/A',
            is_banned: s.user?.isBanned ? 'YES' : 'NO',

            problem_type: problemType,
            problem_title: problemTitle,
            difficulty: difficulty,

            status: s.status,
            attempt_count: s.attemptCount,
            awarded_points: s.awardedPoints,
            max_points: maxPoints,
            ai_score: s.aiScore || 0,

            // Content Analysis
            code_length: s.content?.length || 0,
            // Sanitize content for CSV (basic newline replacement to keep it on one line if preferred, 
            // but standard CSV handles newlines in quotes. We'll leave it raw-ish but handle it in frontend)
            code_snippet: s.content ? s.content.slice(0, 500).replace(/[\r\n]+/g, ' ') : '', // Init 500 chars, flattened
            ai_feedback_snippet: s.aiFeedback ? s.aiFeedback.slice(0, 300).replace(/[\r\n]+/g, ' ') : ''
        };
    });
}
