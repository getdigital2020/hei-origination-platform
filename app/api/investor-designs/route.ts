import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/investor-designs
export async function GET() {
  try {
    const investors = await prisma.investor.findMany({
      select: {
        id: true,
        name: true,
        designs: {
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(investors, { status: 200 })
  } catch (err) {
    console.error("Error fetching investor designs:", err)
    return NextResponse.json(
      { error: "Failed to fetch investor designs" },
      { status: 500 }
    )
  }
}
