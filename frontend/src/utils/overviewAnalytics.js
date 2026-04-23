function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function formatKey(date, granularity) {
  if (granularity === 'month') {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  return date.toISOString().slice(0, 10);
}

function formatLabel(date, granularity) {
  if (granularity === 'month') {
    return date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric' });
}

export function getRangeMeta(range = '30d') {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  if (range === 'yesterday') {
    const yesterday = addDays(todayStart, -1);
    return {
      range,
      label: 'Yesterday',
      start: startOfDay(yesterday),
      end: endOfDay(yesterday),
      granularity: 'day'
    };
  }

  if (range === '7d') {
    return { range, label: 'Last 7 days', start: addDays(todayStart, -6), end: todayEnd, granularity: 'day' };
  }

  if (range === '90d') {
    return { range, label: 'Last 90 days', start: addDays(todayStart, -89), end: todayEnd, granularity: 'day' };
  }

  if (range === '1y') {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      range,
      label: 'Last year',
      start: addMonths(monthStart, -11),
      end: todayEnd,
      granularity: 'month'
    };
  }

  return { range: '30d', label: 'Last 30 days', start: addDays(todayStart, -29), end: todayEnd, granularity: 'day' };
}

export function buildTimeBuckets(range = '30d') {
  const meta = getRangeMeta(range);
  const buckets = [];

  if (meta.granularity === 'month') {
    const cursor = new Date(meta.start.getFullYear(), meta.start.getMonth(), 1);
    while (cursor <= meta.end) {
      buckets.push({
        key: formatKey(cursor, 'month'),
        label: formatLabel(cursor, 'month')
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  } else {
    const cursor = new Date(meta.start);
    while (cursor <= meta.end) {
      buckets.push({
        key: formatKey(cursor, 'day'),
        label: formatLabel(cursor, 'day')
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return { ...meta, buckets };
}

export function isWithinRange(value, range = '30d') {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const meta = getRangeMeta(range);
  return date >= meta.start && date <= meta.end;
}

export function filterApplicationsByRange(applications = [], range = '30d') {
  return applications.filter((application) => {
    const relevantDates = [
      application.createdAt,
      application.viewedAt,
      application.shortlistedAt,
      application.interviewScheduledAt,
      application.rejectedAt
    ];

    return relevantDates.some((value) => isWithinRange(value, range));
  });
}

export function groupDailyApplications(applications = [], range = '30d') {
  const timeline = buildTimeBuckets(range);
  const buckets = timeline.buckets.map((item) => ({
    ...item,
    applied: 0,
    reviewed: 0,
    shortlisted: 0,
    interview: 0,
    rejected: 0
  }));
  const bucketMap = new Map(buckets.map((item) => [item.key, item]));

  const place = (value, key) => {
    if (!value) return;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return;
    if (date < timeline.start || date > timeline.end) return;
    const bucket = bucketMap.get(formatKey(date, timeline.granularity));
    if (bucket) {
      bucket[key] += 1;
    }
  };

  applications.forEach((application) => {
    const status = String(application.status || '').toLowerCase();
    place(application.createdAt, 'applied');
    place(application.viewedAt || (status === 'reviewed' ? application.createdAt : null), 'reviewed');
    place(application.shortlistedAt || (status === 'shortlisted' ? application.createdAt : null), 'shortlisted');
    place(application.interviewScheduledAt || (status === 'interview_scheduled' ? application.createdAt : null), 'interview');
    place(application.rejectedAt || (status === 'rejected' ? application.createdAt : null), 'rejected');
  });

  return { ...timeline, buckets };
}

export function getPipelineCounts(applications = [], range = '30d') {
  return applications.reduce((counts, application) => {
    if (isWithinRange(application.createdAt, range)) counts.applied += 1;
    if (isWithinRange(application.viewedAt, range) || (!application.viewedAt && String(application.status || '').toLowerCase() === 'reviewed' && isWithinRange(application.createdAt, range))) counts.reviewed += 1;
    if (isWithinRange(application.shortlistedAt, range) || (!application.shortlistedAt && String(application.status || '').toLowerCase() === 'shortlisted' && isWithinRange(application.createdAt, range))) counts.shortlisted += 1;
    if (isWithinRange(application.interviewScheduledAt, range) || (!application.interviewScheduledAt && String(application.status || '').toLowerCase() === 'interview_scheduled' && isWithinRange(application.createdAt, range))) counts.interview += 1;
    if (isWithinRange(application.rejectedAt, range) || (!application.rejectedAt && String(application.status || '').toLowerCase() === 'rejected' && isWithinRange(application.createdAt, range))) counts.rejected += 1;
    return counts;
  }, {
    applied: 0,
    reviewed: 0,
    shortlisted: 0,
    interview: 0,
    rejected: 0
  });
}

export function getSourceBreakdown(applications = [], range = '30d') {
  const counts = new Map();
  applications
    .filter((application) => isWithinRange(application.createdAt, range))
    .forEach((application) => {
      const source = String(application.candidateSource || 'Hirexo Portal').trim() || 'Hirexo Portal';
      counts.set(source, (counts.get(source) || 0) + 1);
    });

  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value);
}

export function getRejectionBreakdown(applications = [], range = '30d') {
  const counts = new Map();
  applications
    .filter((application) => isWithinRange(application.rejectedAt || application.createdAt, range))
    .filter((application) => application.rejectedAt || String(application.status || '').toLowerCase() === 'rejected')
    .forEach((application) => {
      const reason = String(application.rejectionReason || 'Not specified').trim() || 'Not specified';
      counts.set(reason, (counts.get(reason) || 0) + 1);
    });

  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value);
}

export function groupRegistrationSeries(registrations = [], range = '30d') {
  const timeline = buildTimeBuckets(range);
  const buckets = timeline.buckets.map((item) => ({
    ...item,
    registrations: 0
  }));
  const bucketMap = new Map(buckets.map((item) => [item.key, item]));

  registrations.forEach((entry) => {
    if (!entry?.date) return;
    const date = new Date(entry.date);
    if (Number.isNaN(date.getTime())) return;
    if (date < timeline.start || date > timeline.end) return;
    const bucket = bucketMap.get(formatKey(date, timeline.granularity));
    if (bucket) {
      bucket.registrations += Number(entry.count || 0);
    }
  });

  return { ...timeline, buckets };
}

export function getDonutStyle(items = []) {
  const palette = ['#f4c542', '#36c48f', '#55a8ff', '#ff8a5b', '#7f7cff', '#ec5f89'];
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (!total) {
    return {
      background: 'conic-gradient(#e6eee9 0 100%)'
    };
  }

  let start = 0;
  const segments = items.map((item, index) => {
    const percent = (item.value / total) * 100;
    const end = start + percent;
    const color = palette[index % palette.length];
    const segment = `${color} ${start}% ${end}%`;
    start = end;
    return segment;
  });

  return {
    background: `conic-gradient(${segments.join(', ')})`
  };
}
