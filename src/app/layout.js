import { Inter } from "next/font/google";
import "./globals.css";
import ShieldBot from "@/components/ShieldBot";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "ShieldCart — Consumer Protection Platform",
  description:
    "ShieldCart physically inspects every product before delivery so you never receive defective, counterfeit, or wrong items. Your trusted consumer protection platform for Indian e-commerce.",
  keywords: [
    "ShieldCart",
    "consumer safety",
    "product inspection",
    "product verification",
    "e-commerce trust",
    "India",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.variable}>
        {children}
        <ShieldBot />
      </body>
    </html>
  );
}
