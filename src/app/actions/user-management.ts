'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleBanUser(userId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
        throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            isBanned: !user.isBanned
        }
    });

    revalidatePath('/admin');
    revalidatePath('/admin/usage');

    return { success: true, isBanned: updatedUser.isBanned };
}
