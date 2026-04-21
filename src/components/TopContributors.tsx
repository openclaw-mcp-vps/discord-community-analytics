import { Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ContributorInsight } from "@/lib/types";

interface TopContributorsProps {
  contributors: ContributorInsight[];
}

export function TopContributors({ contributors }: TopContributorsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {contributors.map((contributor, idx) => (
        <article
          key={contributor.memberId}
          className="rounded-lg border border-slate-800 bg-slate-950/50 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Member</p>
              <h3 className="text-base font-semibold text-slate-100">{contributor.username}</h3>
            </div>
            <Badge variant={idx < 3 ? "success" : "default"}>
              <Trophy className="mr-1 h-3.5 w-3.5" /> #{idx + 1}
            </Badge>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm text-slate-300">
            <div>
              <dt className="text-slate-500">Messages</dt>
              <dd className="font-medium">{contributor.messageCount}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Avg words/msg</dt>
              <dd className="font-medium">{contributor.averageWordsPerMessage}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Word volume</dt>
              <dd className="font-medium">{contributor.wordCount}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Engagement score</dt>
              <dd className="font-medium text-sky-300">{contributor.engagementScore}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}
