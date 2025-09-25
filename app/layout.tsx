import "./globals.css"
import React from "react"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata = {
  title: "HEI Origination Platform",
  description:
    "Scaffold with Next 14, Prisma, Tailwind, shadcn-like UI, RHF, Zod, Puppeteer",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main className="p-6">
            <div className="max-w-3xl mx-auto">{children}</div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
