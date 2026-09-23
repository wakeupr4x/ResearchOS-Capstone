import "./globals.css";
import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ModeProvider } from "@/context/ModeContext";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

export const metadata: Metadata = {
  title: "ResearchOS | AI Literature Intelligence & Scientific Discovery",
  description: "Production-grade AI literature intelligence platform with hybrid RAG, document intelligence, multi-paper comparison, live web search, and citation-backed synthesis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F8FAFC] text-foreground selection:bg-blue-100 selection:text-blue-900 font-sans">
        <AuthProvider>
          <LanguageProvider>
            <ModeProvider>
              <AppShell>{children}</AppShell>
            </ModeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
