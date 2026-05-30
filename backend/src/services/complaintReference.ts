import type { PrismaClient } from '@prisma/client'

export async function generateComplaintId(prisma: PrismaClient): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `RW-${year}-`

  const latest = await prisma.complaint.findFirst({
    where: {
      complaintId: {
        startsWith: prefix,
      },
    },
    orderBy: { complaintId: 'desc' },
    select: { complaintId: true },
  })

  let sequence = 1
  if (latest?.complaintId) {
    const suffix = latest.complaintId.slice(prefix.length)
    const parsed = Number.parseInt(suffix, 10)
    if (!Number.isNaN(parsed)) {
      sequence = parsed + 1
    }
  }

  return `${prefix}${String(sequence).padStart(4, '0')}`
}
