'use server';

import { prisma } from "@/lib/db";
import { fetchGitHubIssue } from "@/lib/github";
import { revalidatePath } from "next/cache";

export async function createIssue(formData: FormData) {
    const url = formData.get('url') as string;
    const points = parseInt(formData.get('points') as string);

    if (!url || !points) {
        return { error: "URL and Points are required" };
    }

    try {
        const issueData = await fetchGitHubIssue(url);

        await prisma.issue.create({
            data: {
                repoUrl: issueData.repoUrl,
                issueNumber: issueData.issueNumber,
                title: issueData.title,
                description: issueData.description || "",
                basePoints: points,
                status: "OPEN",
            }
        });

        revalidatePath('/admin/issues');
        revalidatePath('/issues');
        return { success: true };

    } catch (error: any) {
        console.error("Failed to create issue:", error);
        if (error.code === 'P2002') {
            return { error: "This issue has already been added." };
        }
        return { error: error.message || "Failed to create issue" };
    }
}
