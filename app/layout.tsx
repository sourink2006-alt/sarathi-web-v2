import type { Metadata } from "next";
import {
  EB_Garamond,
  DM_Sans,
  Bebas_Neue,
  Archivo,
  Tiro_Bangla,
  Manrope,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";
import "@/components/ui/editor.css";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { RouteJourney } from "@/components/layout/route-journey";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo-v",
  subsets: ["latin"],
  axes: ["wdth"],
});

const tiroBangla = Tiro_Bangla({
  variable: "--font-tiro-v",
  weight: "400",
  subsets: ["bengali", "latin"],
});

const manrope = Manrope({
  variable: "--font-manrope-v",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta-v",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SCA | Sarathi Cultural Association",
  description: "From Kolkata to Bengaluru — Every Bengali Carries Two Homes",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ebGaramond.variable} ${dmSans.variable} ${bebasNeue.variable} ${archivo.variable} ${tiroBangla.variable} ${manrope.variable} ${jakarta.variable} min-h-full antialiased dark`}
    >
      <body className="flex min-h-full flex-col bg-night text-cream">
        <BrandLockup />
        <RouteJourney />
        {children}
      </body>
    </html>
  );
}
