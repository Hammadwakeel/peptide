import "./globals.css";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";

/** Editorial — testimonials, quotes, taglines only */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "400"],
});

/** Technical — IDs, SKUs, tracking numbers (≤12px in UI) */
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata = {
  title: "Frontier Biomed",
  description: "The foundational supply layer of the peptide economy.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${jetbrains.variable} font-sans font-light antialiased bg-deep-teal`}
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
