import { ActivateAccessForm } from "@/components/ActivateAccessForm";

interface CheckoutSuccessPageProps {
  searchParams: Promise<{
    serverId?: string;
    order_id?: string;
    orderId?: string;
  }>;
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const params = await searchParams;
  const defaultServerId = params.serverId ?? "";
  const defaultOrderId = params.order_id ?? params.orderId ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d1117] px-4 py-8">
      <ActivateAccessForm defaultServerId={defaultServerId} defaultOrderId={defaultOrderId} />
    </main>
  );
}
