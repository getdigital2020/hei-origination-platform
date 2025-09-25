import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/applications/:id
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const app = await prisma.application.findUnique({
        where: { id: params.id },
        include: {
          applicants: true,
          property: true,
          documents: true,
          investor: { select: { id: true, name: true } }, // ✅ investor details
          offers: {
            include: {
              contractDesign: { select: { id: true, name: true } }, // ✅ contract design details
           },
           orderBy: [
            { isActive: "desc" }, // ✅ active offers first
            { createdAt: "asc" }, // then by oldest created
          ],
        },
      },
    })

    if (!app) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(app, { status: 200 })
  } catch (err) {
    console.error("Error fetching application:", err)
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    )
  }
}
