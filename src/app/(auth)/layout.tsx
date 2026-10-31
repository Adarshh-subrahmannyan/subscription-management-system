export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-dvh bg-surface-muted flex items-center justify-center p-4">
      {children}
    </main>
  );
}
