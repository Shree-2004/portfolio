import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shree Londhe — Eval Report",
  description:
    "AI/ML engineer portfolio for Shree Londhe, framed as a live agent evaluation report — multi-agent systems, RAG, and the harnesses that keep them honest.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
