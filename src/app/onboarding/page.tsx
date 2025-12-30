import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { setSemester } from "@/app/actions/user";
import Navbar from "@/components/Navbar";

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect('/api/auth/signin');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (user?.semester) {
        redirect('/dashboard');
    }

    return (
        <main style={{ minHeight: '100vh', paddingTop: '100px', background: '#FAFAFA' }}>
            <Navbar />
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>

                <h1 style={{ fontSize: '40px', fontWeight: '700', marginBottom: '16px', backgroundImage: 'linear-gradient(135deg, #1d1d1f 0%, #434344 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Welcome, {user?.name?.split(' ')[0]}!
                </h1>
                <p style={{ fontSize: '18px', color: '#86868b', marginBottom: '48px', maxWidth: '500px', margin: '0 auto 48px' }}>
                    To personalize your experience, please tell us which semester you are currently in.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SemesterButton key={sem} semester={sem} />
                    ))}
                </div>

            </div>
        </main>
    );
}

function SemesterButton({ semester }: { semester: number }) {
    // Client component wrapper for the button functionality would be cleaner,
    // but we can make this work via form + server action for simplicity in this file 
    // or better, use a client component for the button.
    // Given the constraints and requested "Premium Design" which often needs interactivity,
    // let's stick to a form which feels native and robust, but style it nicely.

    const isFirst = semester === 1;

    return (
        <form action={async () => {
            'use server';
            await setSemester(semester);
        }}>
            <button
                type="submit"
                className="glass-panel"
                style={{
                    width: '100%',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isFirst ? '2px solid rgba(0, 113, 227, 0.5)' : '1px solid rgba(255, 255, 255, 0.8)',
                    background: isFirst ? 'rgba(0, 113, 227, 0.05)' : 'var(--glass-bg)',
                    gap: '8px'
                }}
            >
                <span style={{ fontSize: '14px', color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Semester</span>
                <span style={{ fontSize: '32px', fontWeight: '700', color: isFirst ? '#0071e3' : 'var(--foreground)' }}>{semester}</span>
                {isFirst && <span style={{ fontSize: '12px', color: '#0071e3', fontWeight: '600' }}>Beginner Track</span>}
            </button>
        </form>
    );
}
