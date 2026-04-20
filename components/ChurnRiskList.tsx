import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { ChurnRiskMember } from "@/lib/types";

interface ChurnRiskListProps {
  members: ChurnRiskMember[];
}

function riskVariant(level: ChurnRiskMember["riskLevel"]): "success" | "warning" | "danger" {
  if (level === "high") {
    return "danger";
  }

  if (level === "medium") {
    return "warning";
  }

  return "success";
}

export function ChurnRiskList({ members }: ChurnRiskListProps) {
  if (members.length === 0) {
    return <p className="text-sm text-slate-400">No at-risk members detected this week.</p>;
  }

  return (
    <ul className="space-y-3">
      {members.slice(0, 10).map((member) => (
        <li key={member.memberId} className="rounded-lg border border-slate-800 bg-slate-900/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium text-slate-100">{member.username}</p>
              <p className="mt-1 text-xs text-slate-400">{member.reason}</p>
            </div>
            <Badge variant={riskVariant(member.riskLevel)}>
              {member.riskLevel.toUpperCase()} • {member.riskScore}
            </Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="rounded-md bg-slate-800 px-2 py-1">Inactive: {member.daysInactive} days</span>
            <span className="rounded-md bg-slate-800 px-2 py-1">Last 7d: {member.messagesLast7}</span>
            <span className="rounded-md bg-slate-800 px-2 py-1">Prev 7d: {member.messagesPrevious7}</span>
            {member.lastActiveAt ? (
              <span className="rounded-md bg-slate-800 px-2 py-1">
                Last active {formatDistanceToNowStrict(parseISO(member.lastActiveAt), { addSuffix: true })}
              </span>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
