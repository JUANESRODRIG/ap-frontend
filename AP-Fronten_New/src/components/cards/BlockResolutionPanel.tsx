import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Target } from "lucide-react";

interface Props {
    resolvedCount: number;
    touchlessRate?: number;
}

const mockChartData = [
    { date: "1/01", netValue: 1200000, parkedItems: 2400 },
    { date: "1/03", netValue: 1400000, parkedItems: 2600 },
    { date: "1/05", netValue: 1100000, parkedItems: 2200 },
    { date: "1/08", netValue: 1600000, parkedItems: 2800 },
    { date: "1/10", netValue: 1300000, parkedItems: 2500 },
    { date: "1/12", netValue: 1700000, parkedItems: 2900 },
    { date: "1/15", netValue: 1500000, parkedItems: 2700 },
    { date: "1/18", netValue: 1800000, parkedItems: 3000 },
    { date: "1/20", netValue: 1400000, parkedItems: 2600 },
    { date: "1/23", netValue: 1600000, parkedItems: 2800 },
    { date: "1/26", netValue: 1500000, parkedItems: 2700 },
];

function BlockResolutionPanel({ resolvedCount, touchlessRate = 68 }: Props) {
    return (
        <div className="agent-panel" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
                <div style={{ 
                    width: "48px", 
                    height: "48px", 
                    borderRadius: "50%", 
                    border: "2px solid #1a4632", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    marginRight: "16px"
                }}>
                    <Target color="#1a4632" size={28} strokeWidth={2} />
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                    Block Resolution
                </h3>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
                <div>
                    <p style={{ 
                        fontSize: "0.85rem", 
                        color: "var(--text-muted)", 
                        fontWeight: 600, 
                        marginBottom: "4px"
                    }}>
                        Issues Resolved (Today)
                    </p>
                    <h2 style={{ 
                        fontSize: "2.5rem", 
                        fontWeight: 800, 
                        color: "var(--text-primary)", 
                        margin: 0,
                        lineHeight: 1
                    }}>
                        {resolvedCount}
                    </h2>
                </div>
                <div>
                    <p style={{ 
                        fontSize: "0.85rem", 
                        color: "var(--text-muted)", 
                        fontWeight: 600, 
                        marginBottom: "4px"
                    }}>
                        Touchless Resolution Rate
                    </p>
                    <h2 style={{ 
                        fontSize: "2.5rem", 
                        fontWeight: 800, 
                        color: "#16a34a", 
                        margin: 0,
                        lineHeight: 1
                    }}>
                        {touchlessRate}%
                    </h2>
                </div>
            </div>

            <div style={{ height: "240px", width: "100%", marginBottom: "30px" }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <ComposedChart data={mockChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: "var(--text-muted)", fontSize: 12 }} 
                            dy={10}
                        />
                        <YAxis 
                            yAxisId="left"
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                            ticks={[0, 450000, 900000, 1350000, 1800000]}
                        />
                        <YAxis 
                            yAxisId="right" 
                            orientation="right" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                            ticks={[0, 750, 1500, 2250, 3000]}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: "var(--card-bg)", 
                                borderColor: "var(--border-color)",
                                color: "var(--text-primary)"
                            }}
                            itemStyle={{ color: "var(--text-primary)" }}
                        />
                        <Legend 
                            iconType="circle" 
                            wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
                        />
                        <Bar 
                            yAxisId="left" 
                            dataKey="netValue" 
                            name="Net value P&B Invoices" 
                            fill="#1f4e38" 
                            radius={[2, 2, 0, 0]} 
                            barSize={30}
                        />
                        <Line 
                            yAxisId="right" 
                            type="monotone" 
                            dataKey="parkedItems" 
                            name="# of Parked Invoice Items" 
                            stroke="#4ade80" 
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 2, fill: "var(--card-bg)", stroke: "#4ade80" }}
                            activeDot={{ r: 6, fill: "#4ade80" }} 
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div style={{ marginTop: "auto" }}>
                <button style={{
                    width: "100%",
                    padding: "14px",
                    backgroundColor: "#1f4e38",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#153a29"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#1f4e38"}
                >
                    Deep Dive
                </button>
            </div>
        </div>
    );
}

export default BlockResolutionPanel;
