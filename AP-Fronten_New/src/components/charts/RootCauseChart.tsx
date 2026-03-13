import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
    data: any[];
}

const COLORS = [
    "#10b981", // Green (Vibrant)
    "#3b82f6", // Accent Blue
    "#8b5cf6", // Accent Purple
    "#f59e0b", // Accent Orange
    "#ef4444"  // Accent Red
];

// Custom stylish tooltip
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                padding: '12px 16px',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-md)',
            }}>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                    {payload[0].name}
                </p>
                <p style={{ margin: 0, marginTop: '4px', color: payload[0].payload.fill, fontWeight: 700, fontSize: '1.1rem' }}>
                    {payload[0].value} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Exceptions</span>
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
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                No exceptions currently diagnosed.
            </div>
        );
    }

    // Calculate total exceptions for percentage
    const totalExceptions = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            width: "100%",
            gap: "20px",
        }}>
            {/* Pie Chart */}
            <div style={{ width: "100%", height: 200 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
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
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Custom Legend Below */}
            <div style={{ 
                width: "100%", 
                display: "flex", 
                flexDirection: "column", 
                gap: "10px",
            }}>
                {data.map((entry, index) => {
                    const percentage = totalExceptions > 0 ? Math.round((entry.value / totalExceptions) * 100) : 0;
                    
                    return (
                        <div key={index} style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "space-between",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, flex: 1 }}>
                                <div style={{ 
                                    width: 8, 
                                    height: 8, 
                                    borderRadius: "50%", 
                                    backgroundColor: COLORS[index % COLORS.length],
                                    flexShrink: 0,
                                }} />
                                <span style={{ 
                                    fontSize: "0.78rem", 
                                    color: "var(--text-secondary)", 
                                    fontWeight: 500,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}>
                                    {entry.name}
                                </span>
                            </div>
                            <span style={{ 
                                fontSize: "0.85rem", 
                                fontWeight: 700, 
                                color: "var(--text-primary)",
                                flexShrink: 0,
                                marginLeft: "8px",
                            }}>
                                {percentage}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default RootCauseChart;
