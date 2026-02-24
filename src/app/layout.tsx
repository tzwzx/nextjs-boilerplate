import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./reset.scss";
import "./globals.scss";

export const metadata: Metadata = {
  description: "",
  title: "",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
