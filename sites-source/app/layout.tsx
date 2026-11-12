import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tradebook | MNQ Journal",
  description: "Your private MNQ trading journal.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
