export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh overflow-x-hidden overflow-y-auto lg:h-dvh lg:overflow-hidden">
      {children}
    </div>
  );
}
