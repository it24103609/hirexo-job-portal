function formatIcsDate(value) {
  const date = new Date(value);
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcs(value = '') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function buildInterviewCalendarInvite({
  candidateName,
  companyName,
  jobTitle,
  scheduledAt,
  interviewMode,
  interviewLocation,
  interviewMeetingLink,
  interviewNotes,
  durationMinutes = 45
}) {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  const summary = `Interview: ${jobTitle} at ${companyName}`;
  const location = interviewMeetingLink || interviewLocation || interviewMode || 'Interview';
  const descriptionParts = [
    `Candidate: ${candidateName || 'Candidate'}`,
    `Company: ${companyName || 'Employer'}`,
    `Role: ${jobTitle || 'Job role'}`,
    `Mode: ${interviewMode || 'Not specified'}`,
    interviewLocation ? `Location: ${interviewLocation}` : '',
    interviewMeetingLink ? `Meeting link: ${interviewMeetingLink}` : '',
    interviewNotes ? `Notes: ${interviewNotes}` : ''
  ].filter(Boolean);

  const now = formatIcsDate(new Date());
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}@hirexo.com`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hirexo//Interview Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `LOCATION:${escapeIcs(location)}`,
    `DESCRIPTION:${escapeIcs(descriptionParts.join('\n'))}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return lines.join('\r\n');
}

module.exports = {
  buildInterviewCalendarInvite
};
