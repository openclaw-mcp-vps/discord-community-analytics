import { MessageSquare, TrendingUp } from "lucide-react";
import type { TopContributor } from "@/lib/types";

interface TopContributorsProps {
  contributors: TopContributor[];
}

export function TopContributors({ contributors }: TopContributorsProps) {
  if (contributors.length === 0) {
    return <p className="text-sm text-slate-400">No message data yet. Invite the bot and let it capture activity.</p>;
  }

  return (
    <ul className="space-y-3">
      {contributors.slice(0, 8).map((contributor, index) => (
        <li key={contributor.memberId} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 p-3">
          <div>
            <p className="font-medium text-slate-100">
              #{index + 1} {contributor.username}
            </p>
            <p className="mt-1 text-xs text-slate-400">{contributor.activeDays} active days in the last month</p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 px-2 py-1 text-blue-200">
              <MessageSquare className="h-3 w-3" /> {contributor.messageCount}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-1 text-emerald-200">
              <TrendingUp className="h-3 w-3" /> {contributor.engagementScore}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
