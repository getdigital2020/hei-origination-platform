import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import crypto from "crypto"

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// POST /api/applications/:id/documents
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { type, filename, contentType, confirm, url } = await req.json()

    // === Step 1: Request signed URL ===
    if (!confirm) {
      if (!type || !filename || !contentType) {
        return NextResponse.json(
          { error: "type, filename, and contentType required" },
          { status: 400 }
        )
      }

      // Generate unique key for S3
      const key = `applications/${params.id}/${crypto.randomUUID()}-${filename}`

      // Create signed URL (valid 5 min)
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        ContentType: contentType,
      })
      const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 })

      // Public URL where file will be accessible
      const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

      return NextResponse.json({ signedUrl, fileUrl })
    }

    // === Step 2: Confirm upload + save DB record ===
    if (confirm && url && type) {
      const doc = await prisma.document.create({
        data: {
          applicationId: params.id,
          type,
          url,
        },
      })
      return NextResponse.json(doc, { status: 201 })
    }

    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  } catch (err) {
    console.error("Document route error:", err)
    return NextResponse.json(
      { error: "Document flow failed" },
      { status: 500 }
    )
  }
}
