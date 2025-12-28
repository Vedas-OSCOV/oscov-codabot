import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vedas-OSCOV Coding Marathon",
  description: "Solve issues, earn points, ascend the leaderboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
