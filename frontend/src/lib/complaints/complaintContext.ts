import type { ResolvedComplaintDetail } from './resolveComplaint'

export function buildComplaintContextBlock(complaint: ResolvedComplaintDetail): string {
  const locationLine =
    complaint.locationLabel ??
    [complaint.city, complaint.state].filter(Boolean).join(', ')

  return [
    'ACTIVE COMPLAINT CONTEXT (use for every answer about "this complaint" or "this issue"):',
    `Complaint ID: ${complaint.referenceId}`,
    `Issue type: ${complaint.issueType ?? 'Unknown'}`,
    `Description: ${complaint.description || 'Not provided'}`,
    `Severity: ${complaint.severity ?? 'Unknown'}`,
    `Authority: ${complaint.assignedAuthority ?? 'Unknown'}`,
    `Department: ${complaint.assignedDepartment ?? 'Unknown'}`,
    `Status: ${complaint.status}`,
    `Resolution: ${complaint.resolutionStatus ?? 'Not Available'}`,
    `Location: ${locationLine || 'Not Available'}`,
    `Coordinates: ${complaint.lat}, ${complaint.lng}`,
    'Answer using this context. Do not say you lack information about this complaint when these fields are present.',
  ].join('\n')
}

export function augmentPromptWithComplaintContext(
  promptText: string,
  complaint: ResolvedComplaintDetail | null,
): string {
  if (!complaint) return promptText
  return `${buildComplaintContextBlock(complaint)}\n\nUser question:\n${promptText}`
}
