import styles from './AnalyticsCharts.module.css';

interface BarChartProps {
    data: { label: string; value: number }[];
    height?: number;
    color?: string;
}

export function SimpleBarChart({ data, height = 200, color = "#DC2626" }: BarChartProps) {
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className={styles.chartContainer} style={{ height }}>
            {data.map((d, i) => {
                const percentage = (d.value / maxValue) * 100;
                return (
                    <div key={i} className={styles.barWrapper} title={`${d.label}: ${d.value}`}>
                        <div
                            className={styles.bar}
                            style={{
                                height: `${percentage}%`,
                                backgroundColor: color
                            }}
                        />
                        <span className={styles.label}>{d.label}</span>
                    </div>
                );
            })}
        </div>
    );
}
