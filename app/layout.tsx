import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manual Payment Collection",
  description: "Collect and track manual ticket payments"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
