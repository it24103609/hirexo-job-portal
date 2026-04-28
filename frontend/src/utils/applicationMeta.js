export const CANDIDATE_SOURCE_OPTIONS = [
  'Hirexo Portal',
  'LinkedIn',
  'Referral',
  'Website',
  'Agency'
];

export const REJECTION_REASON_OPTIONS = [
  'Skills mismatch',
  'Experience gap',
  'Salary expectation mismatch',
  'Location mismatch',
  'Communication concerns',
  'Role fit mismatch',
  'Position closed',
  'Other'
];

export const OVERVIEW_RANGE_OPTIONS = [
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '1y', label: 'Last year' }
];

export const SCREENING_QUESTION_TYPES = [
  { value: 'text', label: 'Short text' },
  { value: 'textarea', label: 'Long answer' },
  { value: 'yes_no', label: 'Yes / No' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select list' }
];

export const TALENT_STAGE_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'nurturing', label: 'Nurturing' },
  { value: 'archived', label: 'Archived' }
];

export const HIRING_PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

export const OFFER_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' }
];
