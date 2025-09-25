import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

/**
 * GET /api/notes
 * Query params (all optional):
 * - q: string (search in content, case-insensitive)
 * - tag: string (filter notes that have this tag)
 * - tags: comma, separated (hasSome)
 * - mention: string (filter notes that mention this userId/username)
 * - authorId: string
 * - applicationId: string
 * - parentId: string | "root" (root => parentId = null)
 * - visibility: PUBLIC|INTERNAL|PRIVATE
 * - includeReplies: "true" | "false"
 * - includeDeleted: "true" | "false"
 * - pinnedOnly: "true" | "false"
 * - dateFrom/dateTo: ISO strings
 * - take: number (default 50)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const q = searchParams.get("q") ?? undefined
    const tag = searchParams.get("tag") ?? undefined
    const tags = (searchParams.get("tags") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    const mention = searchParams.get("mention") ?? undefined
    const authorId = searchParams.get("authorId") ?? undefined
    const applicationId = searchParams.get("applicationId") ?? undefined
    const parentIdParam = searchParams.get("parentId")
    const parentId =
      parentIdParam === "root" ? null : parentIdParam ?? undefined

    const visibility = searchParams.get("visibility") as
      | "PUBLIC"
      | "INTERNAL"
      | "PRIVATE"
      | null

    const includeReplies = (searchParams.get("includeReplies") ?? "true") === "true"
    const includeDeleted = (searchParams.get("includeDeleted") ?? "false") === "true"
    const pinnedOnly = (searchParams.get("pinnedOnly") ?? "false") === "true"

    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const take = Math.min(
      Math.max(parseInt(searchParams.get("take") ?? "50", 10) || 50, 1),
      200
    )

    // Build where clause
    const where: Prisma.NoteWhereInput = {
      AND: [
        !includeDeleted ? { deletedAt: null } : {},
        q
          ? {
              content: {
                contains: q,
                mode: "insensitive",
              },
            }
          : {},
        tag ? { tags: { has: tag } } : {},
        tags.length ? { tags: { hasSome: tags } } : {},
        mention ? { mentions: { has: mention } } : {},
        authorId ? { createdById: authorId } : {},
        applicationId ? { applicationId } : {},
        parentId !== undefined ? { parentId } : {},
        visibility ? { visibility } : {},
        dateFrom || dateTo
          ? {
              createdAt: {
                gte: dateFrom ? new Date(dateFrom) : undefined,
                lte: dateTo ? new Date(dateTo) : undefined,
              },
            }
          : {},
        pinnedOnly ? { isPinned: true } : {},
      ],
    }

    const notes = await prisma.note.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        replies: includeReplies
          ? {
              where: !includeDeleted ? { deletedAt: null } : undefined,
              include: {
                createdBy: { select: { id: true, name: true, email: true } },
              },
              orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
            }
          : false,
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take,
    })

    return NextResponse.json(notes, { status: 200 })
  } catch (err) {
    console.error("Error fetching notes:", err)
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 })
  }
}

/**
 * POST /api/notes
 * Body:
 * {
 *   content: string
 *   applicationId?: string
 *   parentId?: string | null
 *   createdById?: string
 *   visibility?: "PUBLIC" | "INTERNAL" | "PRIVATE"
 *   tags?: string[]
 *   mentions?: string[]   // usernames or userIds you want to notify/store
 *   fileUrl?: string
 *   isPinned?: boolean
 * }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      content: string
      applicationId?: string
      parentId?: string | null
      createdById?: string
      visibility?: "PUBLIC" | "INTERNAL" | "PRIVATE"
      tags?: string[]
      mentions?: string[]
      fileUrl?: string
      isPinned?: boolean
    }

    if (!body.content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    const note = await prisma.note.create({
      data: {
        content: body.content.trim(),
        applicationId: body.applicationId ?? null,
        parentId: body.parentId ?? null,
        createdById: body.createdById ?? null,
        visibility: body.visibility ?? "INTERNAL",
        tags: body.tags ?? [],
        mentions: body.mentions ?? [],
        fileUrl: body.fileUrl ?? null,
        isPinned: Boolean(body.isPinned),
        reactions: {}, // start empty
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        replies: true,
      },
    })

    // TODO: fire-and-forget notify for mentions (queue / webhook / email)
    // body.mentions?.forEach(u => notifyUser(u, note))

    return NextResponse.json(note, { status: 201 })
  } catch (err) {
    console.error("Error creating note:", err)
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 })
  }
}

/**
 * PATCH /api/notes?id=NOTE_ID
 * Body (all optional; provide only what you want to change):
 * {
 *   content?: string
 *   visibility?: "PUBLIC" | "INTERNAL" | "PRIVATE"
 *   tags?: string[]
 *   mentions?: string[]
 *   fileUrl?: string | null
 *   isPinned?: boolean
 *   // Reactions
 *   reactionAdd?: string      // e.g. "👍"
 *   reactionRemove?: string   // e.g. "👍"
 * }
 */
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 })
    }

    const body = (await request.json()) as {
      content?: string
      visibility?: "PUBLIC" | "INTERNAL" | "PRIVATE"
      tags?: string[]
      mentions?: string[]
      fileUrl?: string | null
      isPinned?: boolean
      reactionAdd?: string
      reactionRemove?: string
    }

    // If we’re changing reactions, load existing reactions first
    let reactionsPatch: Prisma.JsonValue | undefined = undefined
    if (body.reactionAdd || body.reactionRemove) {
      const current = await prisma.note.findUnique({
        where: { id },
        select: { reactions: true },
      })
      const map: Record<string, number> =
        (current?.reactions as Record<string, number> | null) ?? {}

      if (body.reactionAdd) {
        map[body.reactionAdd] = (map[body.reactionAdd] ?? 0) + 1
      }
      if (body.reactionRemove) {
        const n = (map[body.reactionRemove] ?? 0) - 1
        if (n > 0) map[body.reactionRemove] = n
        else delete map[body.reactionRemove]
      }
      reactionsPatch = map
    }

    const updated = await prisma.note.update({
      where: { id },
      data: {
        content: body.content?.trim(),
        visibility: body.visibility,
        tags: body.tags,
        mentions: body.mentions,
        fileUrl: body.fileUrl === undefined ? undefined : body.fileUrl, // allow null
        isPinned:
          typeof body.isPinned === "boolean" ? body.isPinned : undefined,
        reactions: reactionsPatch as any, // Prisma.JsonValue
      },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (err) {
    console.error("Error updating note:", err)
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 })
  }
}

/**
 * DELETE /api/notes?id=NOTE_ID
 * Soft delete by default. Provide deletedBy in body if available.
 * Body:
 * {
 *   deletedBy?: string
 *   hard?: boolean   // true => hard delete
 * }
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 })
    }

    const body = (await request.json().catch(() => ({}))) as {
      deletedBy?: string
      hard?: boolean
    }

    if (body?.hard) {
      await prisma.note.delete({ where: { id } })
      return NextResponse.json({ message: "Note permanently deleted" }, { status: 200 })
    }

    await prisma.note.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: body?.deletedBy ?? null },
    })

    return NextResponse.json({ message: "Note deleted" }, { status: 200 })
  } catch (err) {
    console.error("Error deleting note:", err)
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 })
  }
}
