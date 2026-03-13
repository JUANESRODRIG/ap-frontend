import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { Crosshair } from "lucide-react";
import { useTheme } from "../../lib/ThemeContext";

interface ThreeWayMatchingPanelProps {
    touchlessApprovals: number;
    exceptionRate: number;
    topException?: string;
    topExceptionCount?: number;
}

// Sample weekly data for the bar chart
const weeklyData = [
    { date: "2025-07-16", mismatched: 8, approved: 12 },
    { date: "2025-07-18", mismatched: 12, approved: 13 },
    { date: "2025-07-22", mismatched: 11, approved: 15 },
    { date: "2025-07-24", mismatched: 13, approved: 14 },
    { date: "2025-08-01", mismatched: 10, approved: 16 },
    { date: "2025-08-03", mismatched: 11, approved: 11 },
    { date: "2025-08-05", mismatched: 12, approved: 11 },
    { date: "2025-08-07", mismatched: 10, approved: 14 },
    { date: "2025-08-11", mismatched: 15, approved: 10 },
    { date: "2025-08-13", mismatched: 14, approved: 12 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div
                style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    boxShadow: "var(--shadow-md)",
                    fontSize: "0.82rem",
                }}
            >
                <p
                    style={{
                        margin: 0,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        marginBottom: "6px",
                    }}
                >
                    {label}
                </p>
                {payload.map((entry: any, idx: number) => (
                    <p
                        key={idx}
                        style={{
                            margin: 0,
                            color: entry.color,
                            fontWeight: 600,
                            fontSize: "0.85rem",
                        }}
                    >
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

function ThreeWayMatchingPanel({
    touchlessApprovals,
    exceptionRate,
    topException = "Price Variance",
    topExceptionCount = 34,
}: ThreeWayMatchingPanelProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Theme-aware colors
    const mutedTextColor = isDark ? "rgba(255,255,255,0.5)" : "#6b7280";
    const gridStroke = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
    const tickFill = isDark ? "rgba(255,255,255,0.3)" : "#9ca3af";
    const legendColor = isDark ? "rgba(255,255,255,0.6)" : "#6b7280";
    const cursorFill = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)";

    return (
        <div className="three-way-panel">
            {/* Header */}
            <div className="three-way-header">
                <div className="three-way-icon" style={{ background: "rgba(16, 185, 129, 0.1)", borderColor: "rgba(16, 185, 129, 0.2)" }}>
                    <Crosshair size={22} color="#10b981" />
                </div>
                <div className="three-way-title-group">
                    <h3 className="three-way-title">Matching Agent</h3>
                    <span className="three-way-badge">PO Pipeline</span>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="three-way-metrics" style={{ 
                marginTop: "16px", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "flex-start",
                marginBottom: "24px"
            }}>
                <div className="three-way-metric" style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ minHeight: "40px" }}>
                        <span className="three-way-metric-label" style={{ color: mutedTextColor, fontWeight: 600, fontSize: "0.8rem", lineHeight: "1.4" }}>
                            Touchless Approvals
                            <br />
                            (Today)
                        </span>
                    </div>
                    <span className="three-way-metric-value" style={{ fontSize: "2.8rem", color: "var(--text-primary)", fontWeight: 800, lineHeight: "1" }}>
                        {touchlessApprovals}
                    </span>
                </div>
                <div className="three-way-metric" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right" }}>
                    <div style={{ minHeight: "40px" }}>
                        <span className="three-way-metric-label" style={{ color: mutedTextColor, fontWeight: 600, fontSize: "0.8rem", lineHeight: "1.4" }}>
                            Exception Rate
                        </span>
                    </div>
                    <span className="three-way-metric-value exception-rate" style={{ fontSize: "2.8rem", color: "#fbbf24", fontWeight: 800, lineHeight: "1" }}>
                        {exceptionRate}%
                    </span>
                </div>
            </div>

            {/* Bar Chart */}
            <div className="three-way-chart" style={{ flex: 1, minHeight: "180px" }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart
                        data={weeklyData}
                        barCategoryGap="25%"
                        barGap={4}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke={gridStroke}
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 9, fill: tickFill }}
                            axisLine={false}
                            tickLine={false}
                            interval={2}
                        />
                        <YAxis
                            tick={{ fontSize: 9, fill: tickFill }}
                            axisLine={false}
                            tickLine={false}
                            domain={[0, "auto"]}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: cursorFill }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="square"
                            iconSize={12}
                            wrapperStyle={{
                                paddingTop: "20px",
                                fontSize: "0.8rem",
                            }}
                            formatter={(value: string) => (
                                <span style={{ color: legendColor, fontWeight: 600, paddingLeft: "4px" }}>
                                    {value}
                                </span>
                            )}
                        />
                        <Bar
                            dataKey="approved"
                            name="Approved"
                            fill="#10b981"
                            radius={[2, 2, 0, 0]}
                        />
                        <Bar
                            dataKey="mismatched"
                            name="Mismatched"
                            fill="#f87171"
                            radius={[2, 2, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom Exception Banner */}
            <div className="three-way-banner" style={{ marginTop: "24px" }}>
                Top exception this week: {topException} — {topExceptionCount}{" "}
                cases
            </div>
        </div>
    );
}

export default ThreeWayMatchingPanel;
