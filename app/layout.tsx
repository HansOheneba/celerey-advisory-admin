import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Celerey Advisory Admin",
    template: "%s • Celerey Advisory Admin",
  },
  description:
    "Celerey Advisory Admin helps advisors advise clients, review financial health, and stay aligned with long-term advisory goals.",
  applicationName: "Celerey Advisory Admin",
  icons: {
    icon: "/celerey_symbol_dark.png",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <TooltipProvider>
          {children}
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
