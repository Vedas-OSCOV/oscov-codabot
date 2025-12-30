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
        <main style={{ minHeight: '100vh', paddingTop: '100px' }}>
            <Navbar />
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>

                <div className="retro-window" style={{ padding: '48px', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '24px', marginBottom: '24px', color: '#fff', textShadow: '3px 3px #DC2626', lineHeight: '1.5' }}>
                        WELCOME_USER: {user?.name?.split(' ')[0]}
                    </h1>
                <p style={{ fontSize: '18px', color: '#86868b', marginBottom: '48px', maxWidth: '500px', margin: '0 auto 48px' }}>
                    To personalize your experience, please tell us which semester you are currently in.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '24px' }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <SemesterButton key={sem} semester={sem} />
                        ))}
                    </div>
                </div>

            </div>
        </main>
    );
}

function SemesterButton({ semester }: { semester: number }) {
    const isFirst = semester === 1;

    return (
        <form action={async () => {
            'use server';
            await setSemester(semester);
        }}>
            <button
                type="submit"
                className="retro-window"
                style={{
                    width: '100%',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.1s',
                    background: '#000',
                    border: '2px solid #fff',
                    gap: '12px'
                }}
            >
                <span style={{ fontSize: '12px', color: '#888', fontFamily: '"Press Start 2P"' }}>SEM</span>
                <span style={{ fontSize: '32px', color: '#fff', textShadow: isFirst ? '2px 2px #0f0' : 'none', fontFamily: '"Press Start 2P"' }}>{semester}</span>
                {isFirst && <span style={{ fontSize: '10px', color: '#0f0', fontFamily: '"Share Tech Mono"', borderTop: '1px solid #333', paddingTop: '8px', width: '100%' }}>[BEGINNER_TRACK]</span>}
            </button>
        </form>
    );
}
