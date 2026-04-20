import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-semibold text-slate-100">Server Not Found</h1>
      <p className="text-sm text-slate-400">
        We could not find analytics data for this server ID yet. Install the bot and send events
        to `/api/webhook/discord`, then reload.
      </p>
      <Link href="/">
        <Button variant="outline">Back to landing</Button>
      </Link>
    </main>
  );
}
