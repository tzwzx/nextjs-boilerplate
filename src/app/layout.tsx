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

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="ja">
    <body>
      <main>{children}</main>
    </body>
  </html>
);

export default RootLayout;
