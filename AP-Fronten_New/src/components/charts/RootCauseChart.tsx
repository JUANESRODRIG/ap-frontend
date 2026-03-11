import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Props {
    data: any[];
}

const COLORS = [
    "#00e5a0", // Accent Primary
    "#3b82f6", // Accent Blue
    "#8b5cf6", // Accent Purple
    "#f59e0b", // Accent Orange
    "#ef4444"  // Accent Red
];

// Custom stylish dark mode tooltip
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
            }}>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {payload[0].name}
                </p>
                <p style={{ margin: 0, marginTop: '6px', color: payload[0].payload.fill, fontWeight: 700, fontSize: '1.1rem' }}>
                    {payload[0].value} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>Exceptions</span>
                </p>
            </div>
        );
    }
    return null;
};

function RootCauseChart({ data }: Props) {
    // If no data, show a placeholder
    if (!data || data.length === 0) {
        return (
            <div style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                No exceptions currently diagnosed.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={5}
                    stroke="none"
                    animationBegin={200}
                    animationDuration={800}
                >
                    {data.map((_, index) => (
                        <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                            style={{ filter: `drop-shadow(0px 4px 6px ${COLORS[index % COLORS.length]}40)` }}
                        />
                    ))}
                </Pie>

                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />

                <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: "20px", fontSize: "0.85rem", color: "var(--text-secondary)" }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}

export default RootCauseChart;
