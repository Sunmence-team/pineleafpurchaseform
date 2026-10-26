import React from "react";
import type { OverviewCardsProps } from "../../lib/interfaces";

const OverviewCards: React.FC<OverviewCardsProps> = ({
  title,
  icon: Icon,
  value,
  subtitle,
}) => {
  return (
    <div className="flex relative flex-col gap-1 p-3 rounded-lg bg-secondary border border-primary/10 text-tableData">
      <div className="flex items-center justify-between mb-1">
        {Icon && <Icon size={16} className="text-tableHeading" />}
      </div>
      <p className="text-xs text-tableHeading">{title}</p>
      <p className="text-xl font-medium">{value}</p>
      {subtitle && <small className="text-[10px] opacity-75 font-medium">{subtitle}</small>}
    </div>
  );
};

export default OverviewCards;
