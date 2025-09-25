import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/submissions
export async function GET() {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        applicantName: true,
        coApplicantName: true,
        propertyAddress: true,
        email: true,
        phone: true,
        createdAt: true,
        status: true,
        applicationId: true,
      },
    })

    return NextResponse.json(submissions, { status: 200 })
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}

// POST /api/submissions
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const submission = await prisma.submission.create({
      data: {
        applicantName: body.applicantName,
        coApplicantName: body.coApplicantName || null,
        propertyAddress: body.propertyAddress,
        email: body.email,
        phone: body.phone,
        status: "NEW",
      },
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error("Error creating submission:", error)
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 })
  }
}
