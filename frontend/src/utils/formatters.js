export function currencyRange(min, max) {
  if (!min && !max) return 'Competitive';
  if (min && max) return `₹${Number(min).toLocaleString()} - ₹${Number(max).toLocaleString()}`;
  if (min) return `From ₹${Number(min).toLocaleString()}`;
  return `Up to ₹${Number(max).toLocaleString()}`;
}

export function formatDate(value) {
  if (!value) return 'Recently';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
