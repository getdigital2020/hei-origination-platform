import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: Request) {
  try {
    const { fileName, fileType } = await req.json()

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "Missing fileName or fileType" }, { status: 400 })
    }

    const bucketName = process.env.S3_BUCKET_NAME!
    const key = `uploads/${Date.now()}-${fileName}`

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
    })

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 }) // valid for 1 minute

    return NextResponse.json({ uploadUrl: signedUrl, fileUrl: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}` })
  } catch (err) {
    console.error("Error generating signed URL:", err)
    return NextResponse.json({ error: "Failed to generate signed URL" }, { status: 500 })
  }
}
