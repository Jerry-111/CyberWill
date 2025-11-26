import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CyberWill - Cyber Dating Coach",
  description: "Your personal AI dating coach.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={cn(outfit.className, "bg-background text-foreground antialiased")}>
        {children}
      </body>
    </html>
  );
}
