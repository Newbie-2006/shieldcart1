import { Manrope, Lora } from "next/font/google";
import "./globals.css";
import ShieldBot from "@/components/ShieldBot";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata = {
  title: "ShieldCart — Consumer Safety Platform",
  description:
    "ShieldCart physically inspects every product before delivery so you never receive defective, counterfeit, or wrong items. Your trusted consumer protection platform for Indian e-commerce.",
  keywords: [
    "ShieldCart",
    "consumer safety",
    "product inspection",
    "return fraud prevention",
    "e-commerce trust",
    "India",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${manrope.variable} ${lora.variable}`}>
        {children}
        <ShieldBot />
      </body>
    </html>
  );
}
