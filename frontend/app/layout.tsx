import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrustGuard AI Platform",
  description: "AI-Enhanced Zero Trust Security",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
