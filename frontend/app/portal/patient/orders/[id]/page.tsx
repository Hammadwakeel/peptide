import { PatientOrderDetail } from "@/components/portal/patient/PatientOrderDetail";

export const metadata = {
  title: "Order detail — Patient portal",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PatientOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <PatientOrderDetail orderId={id} />;
}
