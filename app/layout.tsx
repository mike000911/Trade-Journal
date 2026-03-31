import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nasdaq Trade Journal",
  description: "A premium manual trade journal for Nasdaq traders."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
