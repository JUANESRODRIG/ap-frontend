import type { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  trendUp?: boolean;
  isGood?: boolean;
}

function KPIBox({ title, value, icon, trend, trendUp, isGood }: Props) {
  return (
    <div className="kpi-box animate-fade-in-up">
      <div className="kpi-box-header">
        <h4 className="kpi-box-title">{title}</h4>
        {icon && (
          <div className="kpi-box-icon">
            {icon}
          </div>
        )}
      </div>
      <h2 className="kpi-box-value">{value}</h2>

      {trend && (
        <div className={`kpi-box-trend ${isGood ? "good" : trendUp ? "up" : "down"}`}>
          {trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span>{trend}</span>
          <span className="kpi-box-trend-label">vs last month</span>
        </div>
      )}
    </div>
  );
}

export default KPIBox;