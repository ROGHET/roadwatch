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
  applicantAddress?: string
  subject?: string
  state?: string
}

export type RtiDocument = {
  plainText: string
  informationItems: string[]
  applicantLine: string
  authority: string
  date: string
  subject: string
  applicantAddress: string
  feeDeclaration: string
}

export const STATE_PWD_AUTHORITIES = [
  'Maharashtra PWD',
  'Tamil Nadu PWD',
  'UP PWD',
  'NHAI',
  'Municipal Corporation',
] as const

export function inferStatePwdAuthority(state?: string): string {
  if (!state) return 'State PWD'
  const normalized = state.toLowerCase()
  if (normalized.includes('maharashtra')) return 'Maharashtra PWD'
  if (normalized.includes('tamil')) return 'Tamil Nadu PWD'
  if (normalized.includes('uttar pradesh') || normalized === 'up') return 'UP PWD'
  return `${state} PWD`
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
  const applicantLine = input.applicantName?.trim() || '___________________________'
  const applicantAddress = input.applicantAddress?.trim() || '___________________________'
  const informationItems = splitInformationItems(input.informationSought)
  const subject = input.subject?.trim() || 'Request for information under the Right to Information Act, 2005'
  const feeDeclaration =
    'I declare that I am a citizen of India. I am ready to pay the prescribed application fee of Rs. 10/- as applicable under the RTI Rules.'
  const date = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const plainText = [
    'FORM OF APPLICATION FOR SEEKING INFORMATION UNDER THE RTI ACT, 2005',
    '',
    'To,',
    'The Public Information Officer',
    input.publicAuthority,
    input.state ? `${input.state}, India` : '',
    '',
    'From,',
    applicantLine,
    applicantAddress,
    '',
    'Subject:',
    subject,
    '',
    'Particulars of information required:',
    ...informationItems.map((item, index) => `${index + 1}. ${item}`),
    '',
    'Fee Declaration:',
    feeDeclaration,
    '',
    `Place: ${input.state ?? '___________________________'}`,
    `Date: ${date}`,
    '',
    'Signature of Applicant:',
    '___________________________',
    '',
    '--- Page footer ---',
    'RoadWatch RTI Generator | Application under RTI Act 2005',
  ].join('\n')

  return {
    plainText,
    informationItems,
    applicantLine,
    authority: input.publicAuthority,
    date,
    subject,
    applicantAddress,
    feeDeclaration,
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
    'FORM OF APPLICATION FOR SEEKING INFORMATION UNDER THE RTI ACT, 2005',
    '',
    'To,',
    'The Public Information Officer',
    document.authority,
    '',
    'From,',
    document.applicantLine,
    document.applicantAddress,
    '',
    'Subject:',
    document.subject,
    '',
    'Particulars of information required:',
    ...document.informationItems.map((item, index) => `${index + 1}. ${item}`),
    '',
    'Fee Declaration:',
    document.feeDeclaration,
    '',
    `Date: ${document.date}`,
    '',
    'Signature of Applicant: _________________________',
    '',
    'RoadWatch RTI Generator | Application under RTI Act 2005',
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
