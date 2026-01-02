import { getEventHealth } from '@/lib/analytics';
import AnalyticsCard from '@/components/analytics/AnalyticsCard';
import InsightAlert from '@/components/analytics/InsightAlert';
import styles from '../analytics.module.css';

export default async function EventHealthPage() {
    const data = await getEventHealth();

    // Insights Logic
    let participationVerdict = {
        type: 'info' as const,
        title: 'Healthy Participation',
        msg: 'Participation is within normal range.',
        rec: 'Keep doing what you are doing.'
    };

    if (data.participationRate < 40) {
        participationVerdict = {
            type: 'info',
            title: 'Critical: Low Participation (<40%)',
            msg: 'The drop-off from registration to participation is alarming. You lost most users before they even started.',
            rec: 'Investigate onboarding friction or marketing mismatch. Was the event timing bad?'
        };
    } else if (data.participationRate > 75) {
        participationVerdict = {
            type: 'info',
            title: 'Excellent Engagement (>75%)',
            msg: 'Your users are extremely motivated. The hype matched the reality.',
            rec: 'Analyze what channel brought these high-intent users.'
        };
    }

    let engagementVerdict = {
        type: 'info' as const,
        title: 'Standard Engagement',
        msg: 'Users are solving a moderate number of problems.',
        rec: ''
    };

    if (data.avgProblemsSolvedPerParticipant < 1) {
        engagementVerdict = {
            type: 'info',
            title: 'Struggling Users',
            msg: 'Average active user solved less than 1 problem. The barrier to entry was too high.',
            rec: 'Add more "Hello World" level easy problems to boost initial confidence.'
        };
    } else if (data.avgProblemsSolvedPerParticipant > 5) {
        engagementVerdict = {
            type: 'info',
            title: 'Deep Engagement',
            msg: 'Users are solving >5 problems on average. They are hooked.',
            rec: 'Consider extending the event duration or adding a "Hard Mode" next time.'
        };
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Event Health</h1>
                <p className={styles.subtitle}>
                    Did this thing work or flop?
                </p>
            </header>

            <div className={styles.gridTwo}>
                <InsightAlert
                    title={participationVerdict.title}
                    type={participationVerdict.type}
                    recommendation={participationVerdict.rec}
                >
                    {participationVerdict.msg}
                </InsightAlert>
                <InsightAlert
                    title={engagementVerdict.title}
                    type={engagementVerdict.type}
                    recommendation={engagementVerdict.rec}
                >
                    {engagementVerdict.msg}
                </InsightAlert>
            </div>

            <div className={styles.grid}>
                <AnalyticsCard
                    title="Total Registrations"
                    value={data.totalRegistrations}
                    description="Total number of users who signed up."
                />
                <AnalyticsCard
                    title="Actual Participants"
                    value={data.activeParticipants}
                    description="Users who submitted at least 1 solution."
                />
                <AnalyticsCard
                    title="Participation Rate"
                    value={`${data.participationRate.toFixed(1)}%`}
                    trend={data.participationRate < 40 ? 'down' : 'up'}
                    trendValue={data.participationRate < 40 ? 'Critical' : 'Healthy'}
                    description="Percentage of registrants who actually participated."
                />
                <AnalyticsCard
                    title="Total Submissions"
                    value={data.totalSubmissions}
                />
                <AnalyticsCard
                    title="Total ACs"
                    value={data.totalACs}
                    description="Total number of accepted solutions."
                />
                <AnalyticsCard
                    title="Avg Problems / User"
                    value={data.avgProblemsSolvedPerParticipant.toFixed(2)}
                    description="Average number of problems solved per active participant."
                />
            </div>
        </div>
    );
}
