import Link from "next/link";
import { listKnownServerIds } from "@/lib/database/models";

export const dynamic = "force-dynamic";

export default function DashboardIndexPage() {
  const serverIds = listKnownServerIds();

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-20 text-slate-200">
      <h1 className="text-3xl font-bold">Select a server dashboard</h1>
      <p className="mt-3 text-sm text-slate-400">
        Use the server-specific path after purchase unlock, for example `/dashboard/123456789012345678`.
      </p>

      <div className="mt-8 space-y-3">
        {serverIds.length > 0 ? (
          serverIds.map((serverId) => (
            <Link
              key={serverId}
              href={`/dashboard/${serverId}`}
              className="block rounded-lg border border-slate-800 bg-slate-900/40 p-4 hover:border-blue-400/50"
            >
              {serverId}
            </Link>
          ))
        ) : (
          <p className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-400">
            No ingested server data yet. Connect the Discord bot and send events to `/api/webhook/discord`.
          </p>
        )}
      </div>
    </main>
  );
}
