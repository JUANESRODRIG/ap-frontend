interface Props {
    title: string;
    value1: string | number;
    label1: string;
    value2?: string | number;
    label2?: string;
}

function AgentPanel({ title, value1, label1, value2, label2 }: Props) {
    return (
        <div className="agent-panel">
            <h3>{title}</h3>

            <div className="agent-metrics">
                <div>
                    <h2>{value1}</h2>
                    <p>{label1}</p>
                </div>

                {value2 && (
                    <div>
                        <h2>{value2}</h2>
                        <p>{label2}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AgentPanel;
