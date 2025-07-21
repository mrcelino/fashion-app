import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], 
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SatuLemari | Platform Redistribusi & Penyewaan Pakaian Berkelanjutan",
  description: "SatuLemari adalah platform berbasis AI untuk redistribusi dan penyewaan pakaian guna mendukung circular economy dan zero waste lifestyle.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
          {children}
      </body>
    </html>
  );
}
