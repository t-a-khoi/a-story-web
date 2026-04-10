import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TokenRefreshProvider } from "@/components/providers/TokenRefreshProvider";
import { TanstackProvider } from "@/components/providers/TanstackProvider";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "A Story - Preserve Your Memories",
  description: "A private, secure space to rewrite your life story and share it with your loved ones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US" className="scroll-smooth">
      <body className={`${inter.className} bg-background text-foreground text-lg md:text-xl font-medium antialiased`}>
        <TanstackProvider>
          <TokenRefreshProvider>
            {children}
          </TokenRefreshProvider>
        </TanstackProvider>
      </body>
    </html>
  );
}