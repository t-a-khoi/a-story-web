import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "A Story - Lưu giữ kỷ niệm",
  description: "Không gian riêng tư, an toàn để bạn viết lại câu chuyện cuộc đời và chia sẻ cho người thân.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-slate-50 text-gray-900 text-base md:text-lg font-medium antialiased`}>
        {children}
      </body>
    </html>
  );
}