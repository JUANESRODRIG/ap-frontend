interface Props {
    resolvedCount: number;
}

function BlockResolutionPanel({ resolvedCount }: Props) {
    return (
        <div className="agent-panel">
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "20px" }}>
                Block Resolution
            </h3>

            <div style={{ marginTop: "10px" }}>
                <h2 style={{ 
                    fontSize: "3.2rem", 
                    fontWeight: 800, 
                    color: "var(--text-primary)", 
                    lineHeight: "1.2",
                    margin: 0
                }}>
                    {resolvedCount}
                </h2>
                <p style={{ 
                    fontSize: "0.85rem", 
                    color: "var(--text-muted)", 
                    fontWeight: 600, 
                    textTransform: "uppercase", 
                    letterSpacing: "0.08em",
                    marginTop: "4px"
                }}>
                    Issues Resolved
                </p>
            </div>
        </div>
    );
}

export default BlockResolutionPanel;
