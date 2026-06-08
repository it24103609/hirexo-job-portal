function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function absoluteUrl(path = '/') {
  const base = String(process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const normalizedPath = String(path || '/').startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

function detailRow(label, value) {
  if (value === undefined || value === null || value === '') return '';
  return `
    <tr>
      <td style="padding:10px 0;color:#667085;font-size:13px;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;color:#101828;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(value)}</td>
    </tr>`;
}

function renderPremiumEmail({
  eyebrow = 'HEXORA',
  title,
  intro,
  badge,
  details = [],
  ctaLabel,
  ctaUrl,
  note,
  footer = 'HEXORA GLOBAL GROUP'
}) {
  const rows = details
    .map((item) => detailRow(item.label, item.value))
    .filter(Boolean)
    .join('');
  const safeTitle = escapeHtml(title);
  const safeIntro = escapeHtml(intro);
  const safeEyebrow = escapeHtml(eyebrow);
  const safeBadge = badge ? escapeHtml(badge) : '';
  const safeCtaLabel = ctaLabel ? escapeHtml(ctaLabel) : '';
  const safeCtaUrl = ctaUrl ? escapeHtml(ctaUrl) : '';
  const safeNote = note ? escapeHtml(note) : '';

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#101828;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 18px 55px rgba(16,24,40,0.12);">
            <tr>
              <td style="background:#0f172a;padding:30px 32px;">
                <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#7dd3fc;font-weight:800;">${safeEyebrow}</div>
                <h1 style="margin:14px 0 0;color:#ffffff;font-size:28px;line-height:1.25;font-weight:800;">${safeTitle}</h1>
                ${safeBadge ? `<div style="display:inline-block;margin-top:18px;padding:8px 12px;border-radius:999px;background:#ecfeff;color:#155e75;font-size:12px;font-weight:800;">${safeBadge}</div>` : ''}
              </td>
            </tr>
            <tr>
              <td style="padding:30px 32px 10px;">
                <p style="margin:0;color:#475467;font-size:15px;line-height:1.75;">${safeIntro}</p>
              </td>
            </tr>
            ${rows ? `
            <tr>
              <td style="padding:10px 32px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-top:1px solid #eaecf0;border-bottom:1px solid #eaecf0;">
                  ${rows}
                </table>
              </td>
            </tr>` : ''}
            ${safeCtaLabel && safeCtaUrl ? `
            <tr>
              <td style="padding:28px 32px 8px;">
                <a href="${safeCtaUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:12px;padding:14px 20px;font-size:14px;font-weight:800;">${safeCtaLabel}</a>
              </td>
            </tr>` : ''}
            ${safeNote ? `
            <tr>
              <td style="padding:14px 32px 28px;">
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px 16px;color:#475467;font-size:13px;line-height:1.6;">${safeNote}</div>
              </td>
            </tr>` : ''}
            <tr>
              <td style="padding:22px 32px;background:#f8fafc;color:#98a2b3;font-size:12px;line-height:1.6;">
                ${escapeHtml(footer)}<br />
                This is an automated email. Please do not reply directly to this message.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function defaultTextToHtml({ subject, text }) {
  const paragraphs = String(text || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 14px;color:#475467;font-size:15px;line-height:1.75;">${escapeHtml(line)}</p>`)
    .join('');

  return renderPremiumEmail({
    eyebrow: 'HEXORA update',
    title: subject || 'HEXORA notification',
    intro: 'You have a new update from HEXORA.',
    note: '',
    footer: 'HEXORA GLOBAL GROUP'
  }).replace(
    /<p style="margin:0;color:#475467;font-size:15px;line-height:1.75;">[^<]*<\/p>/,
    paragraphs || `<p style="margin:0;color:#475467;font-size:15px;line-height:1.75;">${escapeHtml(text || 'You have a new notification from HEXORA.')}</p>`
  );
}

function applicationConfirmationEmail({ candidateName, jobTitle, companyName, applicationId }) {
  return renderPremiumEmail({
    eyebrow: 'Application submitted',
    title: `You applied for ${jobTitle}`,
    badge: 'Application received',
    intro: `Hi ${candidateName || 'there'}, your application has been received successfully. The hiring team can now review your profile, resume, and screening answers.`,
    details: [
      { label: 'Role', value: jobTitle },
      { label: 'Company', value: companyName || 'Employer' },
      { label: 'Status', value: 'Pending review' }
    ],
    ctaLabel: 'View my applications',
    ctaUrl: absoluteUrl('/candidate/applications'),
    note: `Application ID: ${applicationId}. Keep your resume and profile updated so employers can evaluate you faster.`
  });
}

function employerNewApplicationEmail({ employerName, candidateName, jobTitle, applicationId }) {
  return renderPremiumEmail({
    eyebrow: 'New candidate application',
    title: `${candidateName} applied for ${jobTitle}`,
    badge: 'Action recommended',
    intro: `Hi ${employerName || 'there'}, a new candidate application is waiting in your employer dashboard. Review the resume and move the candidate to the next hiring stage when ready.`,
    details: [
      { label: 'Candidate', value: candidateName },
      { label: 'Role', value: jobTitle },
      { label: 'Suggested next step', value: 'Review resume' }
    ],
    ctaLabel: 'Review candidate',
    ctaUrl: absoluteUrl(`/employer/applicants/${applicationId}`),
    note: 'Fast responses improve candidate experience and keep the hiring pipeline warm.'
  });
}

function jobApprovedEmail({ employerName, jobTitle, companyName, jobId }) {
  return renderPremiumEmail({
    eyebrow: 'Job approved',
    title: `${jobTitle} is now live`,
    badge: 'Published',
    intro: `Hi ${employerName || 'there'}, your job post has been approved and published. Candidates can now discover the role and submit applications.`,
    details: [
      { label: 'Role', value: jobTitle },
      { label: 'Company', value: companyName || 'Your company' },
      { label: 'Status', value: 'Live and accepting applications' }
    ],
    ctaLabel: 'Manage this job',
    ctaUrl: absoluteUrl('/employer/jobs'),
    note: `Job ID: ${jobId}. You will receive notifications when candidates apply.`
  });
}

function statusUpdateEmail({ candidateName, jobTitle, companyName, status, interviewAt }) {
  const statusText = String(status || 'updated').replace(/_/g, ' ');
  return renderPremiumEmail({
    eyebrow: 'Application update',
    title: `Your application is ${statusText}`,
    badge: statusText,
    intro: `Hi ${candidateName || 'there'}, there is a new update for your ${jobTitle || 'job'} application.`,
    details: [
      { label: 'Role', value: jobTitle },
      { label: 'Company', value: companyName || 'Employer' },
      { label: 'Status', value: statusText },
      { label: 'Interview time', value: interviewAt ? new Date(interviewAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '' }
    ],
    ctaLabel: 'Open application',
    ctaUrl: absoluteUrl('/candidate/applications'),
    note: status === 'interview_scheduled'
      ? 'Your calendar invite is attached. Please check the meeting link and be ready a few minutes early.'
      : 'You can track the latest application progress from your HEXORA dashboard.'
  });
}

function welcomeEmail({ roleLabel, name, actionLabel, actionUrl, note }) {
  return renderPremiumEmail({
    eyebrow: 'Welcome to HEXORA',
    title: `${roleLabel} account ready`,
    badge: 'Welcome',
    intro: `Hi ${name || 'there'}, your HEXORA ${roleLabel.toLowerCase()} account is ready to use.`,
    ctaLabel: actionLabel,
    ctaUrl: actionUrl,
    note: note || 'You can sign in anytime and continue from your dashboard.'
  });
}

function passwordResetEmail({ name, resetUrl, expiresInMinutes }) {
  return renderPremiumEmail({
    eyebrow: 'Password reset',
    title: 'Reset your HEXORA password',
    badge: `${expiresInMinutes} minute link`,
    intro: `Hi ${name || 'there'}, we received a request to reset your password. Use the secure button below to choose a new one.`,
    ctaLabel: 'Reset password',
    ctaUrl: resetUrl,
    note: `If you did not request this, you can ignore this email. This reset link expires in ${expiresInMinutes} minutes.`
  });
}

function contactAckEmail({ name }) {
  return renderPremiumEmail({
    eyebrow: 'Message received',
    title: 'We received your message',
    badge: 'Support team notified',
    intro: `Hi ${name || 'there'}, thanks for reaching out to HEXORA. Our team has received your inquiry and will get back to you shortly.`,
    ctaLabel: 'Visit HEXORA',
    ctaUrl: absoluteUrl('/contact'),
    note: 'If your request is urgent, please include as much detail as possible when you reply.'
  });
}

function contactReplyEmail({ subject, message }) {
  return renderPremiumEmail({
    eyebrow: 'HEXORA reply',
    title: subject || 'Response from HEXORA',
    intro: 'Our team has replied to your inquiry.',
    note: message
  });
}

// ============ PREMIUM FEATURES ============

function subscriptionSuccessEmail({ name, tier, role, renewalDate, price }) {
  const tierDisplay = String(tier || 'Basic').replace(/_/g, ' ');
  const roleDisplay = String(role || 'User').toLowerCase();
  
  return renderPremiumEmail({
    eyebrow: 'Premium subscription active',
    title: `Welcome to ${tierDisplay} plan`,
    badge: 'Payment confirmed',
    intro: `Hi ${name || 'there'}, thank you for subscribing to HEXORA ${roleDisplay} premium! Your account has been upgraded and premium features are now available.`,
    details: [
      { label: 'Plan', value: tierDisplay },
      { label: 'Price', value: `₹${price || 0}` },
      { label: 'Renewal date', value: renewalDate ? new Date(renewalDate).toLocaleDateString() : '' }
    ],
    ctaLabel: 'Explore premium features',
    ctaUrl: absoluteUrl(role === 'EMPLOYER' ? '/employer/dashboard' : '/candidate/dashboard'),
    note: 'Your premium subscription will automatically renew on the date shown above. You can manage or cancel anytime from settings.'
  });
}

function subscriptionUpgradedEmail({ name, oldTier, newTier, upgradeDate }) {
  return renderPremiumEmail({
    eyebrow: 'Plan upgraded',
    title: `Upgraded to ${newTier.replace(/_/g, ' ')}`,
    badge: 'Plan upgraded',
    intro: `Hi ${name || 'there'}, your subscription has been successfully upgraded from ${oldTier.replace(/_/g, ' ')} to ${newTier.replace(/_/g, ' ')}.`,
    details: [
      { label: 'Previous plan', value: oldTier },
      { label: 'New plan', value: newTier },
      { label: 'Upgrade date', value: new Date(upgradeDate).toLocaleDateString() }
    ],
    ctaLabel: 'View new features',
    ctaUrl: absoluteUrl('/premium/features'),
    note: 'You now have access to advanced features. Check your dashboard for updated tools and capabilities.'
  });
}

function jobFeaturedEmail({ employerName, jobTitle, featuredUntil, featuredType }) {
  const typeDisplay = String(featuredType || 'Top Listing').replace(/_/g, ' ');
  
  return renderPremiumEmail({
    eyebrow: 'Job featured',
    title: `${jobTitle} is now featured`,
    badge: 'Premium feature',
    intro: `Hi ${employerName || 'there'}, congratulations! Your job posting has been featured on HEXORA, which means it will get more visibility and attract better candidates.`,
    details: [
      { label: 'Job title', value: jobTitle },
      { label: 'Feature type', value: typeDisplay },
      { label: 'Featured until', value: new Date(featuredUntil).toLocaleDateString() }
    ],
    ctaLabel: 'View job analytics',
    ctaUrl: absoluteUrl('/employer/analytics'),
    note: 'Featured jobs appear at the top of search results and get 3-5x more visibility. Track performance in your analytics dashboard.'
  });
}

function candidateVerificationCompleteEmail({ candidateName, verificationScore }) {
  const badgeText = verificationScore >= 75 ? 'Fully Verified' : 'Partially Verified';
  
  return renderPremiumEmail({
    eyebrow: 'Profile verified',
    title: `Your profile is ${badgeText}`,
    badge: 'Premium badge earned',
    intro: `Hi ${candidateName || 'there'}, congratulations! Your profile verification is complete. You now have a verification badge that shows employers your profile has been verified.`,
    details: [
      { label: 'Verification score', value: `${verificationScore}%` },
      { label: 'Badge status', value: 'Active' },
      { label: 'Benefits', value: 'Higher visibility & trust' }
    ],
    ctaLabel: 'View your profile',
    ctaUrl: absoluteUrl('/candidate/profile'),
    note: 'Verified profiles receive 2x more job recommendations and are more likely to be shortlisted by employers.'
  });
}

function analyticsReportEmail({ userName, role, reportDate, reportData }) {
  const isEmployer = role === 'EMPLOYER';
  const metrics = isEmployer 
    ? `Total job views: ${reportData.totalViews}, Total applications: ${reportData.totalApplications}`
    : `Profile views: ${reportData.profileViews}, Job recommendations: ${reportData.recommendations}`;
  
  return renderPremiumEmail({
    eyebrow: 'Weekly analytics report',
    title: `Your ${isEmployer ? 'hiring' : 'job search'} analytics`,
    badge: 'Week summary',
    intro: `Hi ${userName || 'there'}, here's your weekly analytics summary for the week of ${new Date(reportDate).toLocaleDateString()}.`,
    details: [
      { label: 'Period', value: 'Last 7 days' },
      { label: 'Summary', value: metrics }
    ],
    ctaLabel: 'View detailed analytics',
    ctaUrl: absoluteUrl(isEmployer ? '/employer/analytics' : '/candidate/analytics'),
    note: 'Premium members get weekly analytics reports. Premium analytics help you optimize your strategy.'
  });
}

function renewalReminderEmail({ name, tier, renewalDate, price }) {
  const daysUntil = Math.ceil((new Date(renewalDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  return renderPremiumEmail({
    eyebrow: 'Subscription renewal',
    title: `Your ${tier} plan renews in ${daysUntil} days`,
    badge: 'Action needed',
    intro: `Hi ${name || 'there'}, your HEXORA premium subscription will automatically renew on ${new Date(renewalDate).toLocaleDateString()}.`,
    details: [
      { label: 'Plan', value: tier },
      { label: 'Renewal amount', value: `₹${price || 0}` },
      { label: 'Renewal date', value: new Date(renewalDate).toLocaleDateString() }
    ],
    ctaLabel: 'Manage subscription',
    ctaUrl: absoluteUrl('/settings/subscription'),
    note: 'To cancel or change your plan, visit your subscription settings before the renewal date.'
  });
}

function subscriptionCancelledEmail({ name, tier, refundAmount }) {
  return renderPremiumEmail({
    eyebrow: 'Subscription cancelled',
    title: 'Your premium subscription has been cancelled',
    badge: 'Cancelled',
    intro: `Hi ${name || 'there'}, your ${tier} subscription has been successfully cancelled.`,
    details: [
      { label: 'Plan', value: tier },
      { label: 'Refund amount', value: refundAmount ? `₹${refundAmount}` : 'N/A' },
      { label: 'Status', value: 'Inactive' }
    ],
    ctaLabel: 'Explore free features',
    ctaUrl: absoluteUrl('/home'),
    note: 'You can resubscribe anytime. We\'d love to have you back! Your feedback helps us improve.'
  });
}

module.exports = {
  renderPremiumEmail,
  defaultTextToHtml,
  applicationConfirmationEmail,
  employerNewApplicationEmail,
  jobApprovedEmail,
  statusUpdateEmail,
  welcomeEmail,
  passwordResetEmail,
  contactAckEmail,
  contactReplyEmail,
  // Premium emails
  subscriptionSuccessEmail,
  subscriptionUpgradedEmail,
  jobFeaturedEmail,
  candidateVerificationCompleteEmail,
  analyticsReportEmail,
  renewalReminderEmail,
  subscriptionCancelledEmail
};
