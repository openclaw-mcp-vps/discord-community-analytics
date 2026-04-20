import { formatDistanceToNow, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import type { ContributorMetric } from "@/lib/types";

interface TopContributorsProps {
  contributors: ContributorMetric[];
}

export default function TopContributors({ contributors }: TopContributorsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Contributors</CardTitle>
        <CardDescription>
          High-impact members ranked by consistency, message volume, and channel diversity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {contributors.map((contributor, index) => (
          <div
            key={contributor.memberId}
            className="rounded-lg border border-slate-800 bg-slate-900/50 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium text-slate-100">
                  #{index + 1} {contributor.username}
                </p>
                <p className="text-xs text-slate-400">
                  Active {formatDistanceToNow(parseISO(contributor.lastActiveAt), { addSuffix: true })}
                </p>
              </div>
              <Badge variant="info">Score {contributor.engagementScore}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
              <span className="rounded bg-slate-800 px-2 py-1">
                {contributor.messageCount} msgs
              </span>
              <span className="rounded bg-slate-800 px-2 py-1">
                {contributor.activeDays} active days
              </span>
              <span className="rounded bg-slate-800 px-2 py-1">
                {contributor.channelDiversity} channels
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
