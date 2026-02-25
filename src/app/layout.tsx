import type { Metadata, Viewport } from "next";

import "./reset.scss";
import "./globals.scss";

export const metadata: Metadata = {
  description: "A generic Next.js boilerplate with modern defaults.",
  title: {
    default: "Next.js Boilerplate",
    template: "%s | Next.js Boilerplate",
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: [
    { color: "#ffffff", media: "(prefers-color-scheme: light)" },
    { color: "#000000", media: "(prefers-color-scheme: dark)" },
  ],
  width: "device-width",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
