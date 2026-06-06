export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh overflow-x-hidden overflow-y-auto lg:h-screen lg:overflow-hidden">
      {children}
    </div>
  );
}
