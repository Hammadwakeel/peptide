import "./globals.css";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";

// The Primary Body Font Fallback
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// The Secondary Display Font (Editorial headers)
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["300", "400"],
});

// The Tertiary Technical Font (Lot numbers, data)
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  title: "Frontier Biomed",
  description: "The foundational supply layer of the peptide economy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable} font-sans antialiased bg-deep-teal`}
      >
        {children}
      </body>
    </html>
  );
}