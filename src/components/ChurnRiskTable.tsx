import { Badge } from "@/components/ui/badge";
import type { ChurnRiskRow } from "@/lib/types";

interface ChurnRiskTableProps {
  rows: ChurnRiskRow[];
}

function getRiskVariant(risk: ChurnRiskRow["riskBand"]) {
  if (risk === "high") {
    return "danger" as const;
  }

  if (risk === "medium") {
    return "warning" as const;
  }

  return "success" as const;
}

export function ChurnRiskTable({ rows }: ChurnRiskTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-800 text-slate-400">
          <tr>
            <th className="px-3 py-2 font-medium">Member</th>
            <th className="px-3 py-2 font-medium">Risk</th>
            <th className="px-3 py-2 font-medium">Inactive Days</th>
            <th className="px-3 py-2 font-medium">Last 7d</th>
            <th className="px-3 py-2 font-medium">Prev 7d</th>
            <th className="px-3 py-2 font-medium">Why</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.memberId} className="border-b border-slate-900 text-slate-200">
              <td className="px-3 py-3">{row.username}</td>
              <td className="px-3 py-3">
                <Badge variant={getRiskVariant(row.riskBand)}>
                  {row.riskBand.toUpperCase()} ({row.riskScore})
                </Badge>
              </td>
              <td className="px-3 py-3">{row.daysInactive}</td>
              <td className="px-3 py-3">{row.recentMessages}</td>
              <td className="px-3 py-3">{row.previousMessages}</td>
              <td className="px-3 py-3 text-slate-400">{row.rationale}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
