import { Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContributorSummary } from "@/lib/types";

interface TopContributorsProps {
  contributors: ContributorSummary[];
}

export function TopContributors({ contributors }: TopContributorsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-[#e3b341]" />
          Top Contributors
        </CardTitle>
        <CardDescription>Members generating the highest conversation momentum.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {contributors.slice(0, 10).map((contributor, index) => (
            <div
              key={contributor.memberId}
              className="flex items-center justify-between rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2"
            >
              <div>
                <p className="text-sm font-semibold text-[#f0f6fc]">
                  {index + 1}. {contributor.memberName}
                </p>
                <p className="text-xs text-[#8b949e]">{contributor.words} topic words shared</p>
              </div>
              <Badge variant="default">{contributor.messages} msgs</Badge>
            </div>
          ))}
          {contributors.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[#30363d] p-4 text-sm text-[#8b949e]">
              No messages in the selected window yet.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
