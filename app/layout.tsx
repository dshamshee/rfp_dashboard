import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import QueryProvider from "@/components/query-provider";
import { SessionProvider } from "@/components/session-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { BackgroundShapes } from "@/components/background-shapes";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "RFP Dashboard - Admin Portal",
  description: "Manage tenders, bids, and RFP tracking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full antialiased font-sans")}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground relative">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <BackgroundShapes />
          <SessionProvider>
            <QueryProvider>
              <TooltipProvider>
                {children}
                <Toaster position="top-right" richColors />
              </TooltipProvider>
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
