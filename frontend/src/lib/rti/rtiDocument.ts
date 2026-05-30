export const RTI_PUBLIC_AUTHORITIES = [
  'NHAI',
  'State PWD',
  'Municipal Corporation',
  'District Engineer',
  'Rural Development Department',
  'Mumbai Metropolitan Road Cell',
] as const

export type RtiFormInput = {
  informationSought: string
  publicAuthority: string
  applicantName?: string
}

export type RtiDocument = {
  plainText: string
  informationItems: string[]
  applicantLine: string
  authority: string
  date: string
}

function splitInformationItems(text: string): string[] {
  const lines = text
    .split(/\n+/)
    .map((line) => line.replace(/^\d+[\).\s-]+/, '').trim())
    .filter(Boolean)

  if (lines.length > 0) return lines

  return [
    text.trim() || 'Details of road maintenance records, inspection reports, and action taken reports.',
  ]
}

export function buildRtiDocument(input: RtiFormInput): RtiDocument {
  const applicantLine = input.applicantName?.trim() || '_________'
  const informationItems = splitInformationItems(input.informationSought)
  const date = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const plainText = [
    'To,',
    'Public Information Officer',
    input.publicAuthority,
    '',
    'Subject:',
    'Request for information under RTI Act 2005',
    '',
    'Applicant:',
    applicantLine,
    '',
    'Information Requested:',
    ...informationItems.map((item, index) => `${index + 1}. ${item}`),
    '',
    `Date: ${date}`,
    '',
    'Signature:',
    '_________',
  ].join('\n')

  return {
    plainText,
    informationItems,
    applicantLine,
    authority: input.publicAuthority,
    date,
  }
}

function escapePdfText(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}

function wrapPdfLine(line: string, maxLength = 82) {
  if (line.length <= maxLength) return [line]
  const words = line.split(' ')
  const lines: string[] = []
  let current = ''

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxLength) {
      if (current) lines.push(current)
      current = word
    } else {
      current = next
    }
  })

  if (current) lines.push(current)
  return lines
}

export function createRtiPdfBlob(document: RtiDocument): Blob {
  const bodyLines = [
    'To,',
    'Public Information Officer',
    document.authority,
    '',
    '________________________________________________________________',
    '',
    'Subject: Request for information under RTI Act 2005',
    '',
    '________________________________________________________________',
    '',
    'Applicant:',
    document.applicantLine,
    '',
    'Information Requested:',
    ...document.informationItems.map((item, index) => `${index + 1}. ${item}`),
    '',
    '________________________________________________________________',
    '',
    `Date: ${document.date}`,
    '',
    'Signature: _________________________',
  ]

  const pdfLines = bodyLines.flatMap((line) => (line ? wrapPdfLine(line) : ['']))
  const content = [
    'BT',
    '/F1 12 Tf',
    '72 770 Td',
    '16 TL',
    ...pdfLines.map((line) => `(${escapePdfText(line)}) Tj T*`),
    'ET',
  ].join('\n')

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>\nendobj\n',
    `5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`,
  ]

  let pdf = '%PDF-1.4\n'
  const offsets = [0]

  objects.forEach((object) => {
    offsets.push(pdf.length)
    pdf += object
  })

  const xrefStart = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return new Blob([pdf], { type: 'application/pdf' })
}
