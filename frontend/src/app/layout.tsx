import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, Caveat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair-display",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "behencode | where she is free to be all of her",
  description: "Effortless, premium clothing designed for every Indian girl. Explore our Tops, Dresses, Denim, and Coord Sets built on comfort, quality, and sisterhood.",
  metadataBase: new URL("https://behencode.co"),
  openGraph: {
    title: "behencode | where she is free to be all of her",
    description: "Effortless, premium clothing designed for every Indian girl. Discover our Tops, Dresses, Denim, and Coord Sets.",
    url: "https://behencode.co",
    siteName: "Behencode",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "behencode | where she is free to be all of her",
    description: "Effortless, premium clothing designed for every Indian girl.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${playfairDisplay.variable} ${caveat.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers session={null}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
