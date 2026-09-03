import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_GALLERY_TITLE || "The Family Album",
  description:
    process.env.NEXT_PUBLIC_GALLERY_SUBTITLE ||
    "Private archive of our moments and memories",
  robots: "noindex, nofollow", // Keep private gallery unindexed
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-album-bg text-album-ink antialiased min-h-screen selection:bg-[#EBE5DA] selection:text-album-ink">
        {children}
      </body>
    </html>
  );
}
