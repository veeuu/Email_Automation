import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "ReachX — Email Intelligence Platform",
  description: "Send smarter. Understand every email you send.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased light" style={{ colorScheme: "light" }}>
      <body className="min-h-full bg-white text-slate-900">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
