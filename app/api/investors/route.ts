import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/investors
export async function GET() {
  try {
    const investors = await prisma.investor.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(investors, { status: 200 })
  } catch (err) {
    console.error("Error fetching investors:", err)
    return NextResponse.json({ error: "Failed to fetch investors" }, { status: 500 })
  }
}
