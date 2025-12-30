'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function setSemester(semester: number) {
    if (semester < 1 || semester > 8) {
        throw new Error("Invalid semester");
    }

    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
        throw new Error("Unauthorized");
    }

    await prisma.user.update({
        where: { email: session.user.email },
        data: { semester }
    });

    revalidatePath('/dashboard');
    redirect('/dashboard');
}
