import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = { title: "PUT & GO — Import", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-paper font-sans text-ink">{children}</body>
    </html>
  );
}
