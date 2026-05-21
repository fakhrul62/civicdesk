import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavigationLoader } from "@/components/navigation-loader";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CivicDesk — Government Complaint Management Portal",
  description:
    "Submit, track, and resolve civic complaints. A transparent government complaint management system for citizens and administrators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased font-sans">
        <ThemeProvider
          defaultTheme="light"
        >
          <LanguageProvider>
            <TooltipProvider>
              <Suspense fallback={null}>
                <NavigationLoader />
              </Suspense>
              <div className="fixed bottom-4 right-4 z-[90] md:hidden">
                <LanguageSwitcher compact />
              </div>
              {children}
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
