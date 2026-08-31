import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workgraph",
  description: "A quiet place for work that keeps moving.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
