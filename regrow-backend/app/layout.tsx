export const metadata = {
  title: 'Regrow Backend API',
  description: 'Backend API server for Regrow application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
