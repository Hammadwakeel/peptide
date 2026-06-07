import { OrderDetail } from "@/components/portal/provider/orders/OrderDetail";

export const metadata = {
  title: "Order detail — Provider portal",
  description: "View order summary, tracking, and timeline.",
};

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DoctorOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return <OrderDetail orderId={id} />;
}
