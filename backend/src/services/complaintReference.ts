import type { PrismaClient } from '@prisma/client'

const FIRST_COMPLAINT_SEQUENCE = 1044

function parseComplaintSequence(complaintId: string, prefix: string): number | null {
  if (!complaintId.startsWith(prefix)) return null
  const parsed = Number.parseInt(complaintId.slice(prefix.length), 10)
  return Number.isNaN(parsed) ? null : parsed
}

export async function generateComplaintId(prisma: PrismaClient): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `RW-${year}-`

  const sequence = await prisma.$transaction(async (tx) => {
    const existingCounter = await tx.complaintReferenceCounter.findUnique({
      where: { year },
      select: { nextSequence: true },
    })

    if (existingCounter) {
      await tx.complaintReferenceCounter.update({
        where: { year },
        data: { nextSequence: { increment: 1 } },
      })
      return existingCounter.nextSequence
    }

    const latest = await tx.complaint.findFirst({
      where: {
        complaintId: {
          startsWith: prefix,
        },
      },
      orderBy: { complaintId: 'desc' },
      select: { complaintId: true },
    })

    const latestSequence = latest?.complaintId
      ? parseComplaintSequence(latest.complaintId, prefix)
      : null
    const firstSequence = Math.max(FIRST_COMPLAINT_SEQUENCE, (latestSequence ?? 0) + 1)

    await tx.complaintReferenceCounter.create({
      data: {
        year,
        nextSequence: firstSequence + 1,
      },
    })

    return firstSequence
  })

  return `${prefix}${String(sequence).padStart(4, '0')}`
}
