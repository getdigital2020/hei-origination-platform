"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  return (
    <nav className="w-full border-b bg-background">
      <div className="max-w-3xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="font-semibold text-lg">
          HEI Origination
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  )
}
