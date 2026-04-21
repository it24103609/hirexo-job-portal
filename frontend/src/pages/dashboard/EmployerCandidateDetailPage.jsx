import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BriefcaseBusiness, Download, FileText, Mail, MapPin, Phone, UserRound } from 'lucide-react';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import { applicationsApi } from '../../services/applications.api';
import { formatDateTime } from '../../utils/formatters';

function renderList(items = []) {
  if (!items.length) {
    return <p className="m-0">Not provided yet.</p>;
  }

  return (
    <ul className="detail-list">
      {items.map((item, index) => <li key={`${String(item)}-${index}`}>{item}</li>)}
    </ul>
  );
}

export default function EmployerCandidateDetailPage() {
  const { applicationId } = useParams();
  const [state, setState] = useState({ loading: true, application: null, error: '' });

  useEffect(() => {
    applicationsApi.getById(applicationId)
      .then((res) => {
        setState({ loading: false, application: res.data || null, error: '' });
      })
      .catch((error) => {
        setState({ loading: false, application: null, error: error.message || 'Unable to load candidate details.' });
      });
  }, [applicationId]);

  if (state.loading) return <Loader label="Loading candidate details..." />;

  if (!state.application) {
    return <EmptyState title="Candidate details unavailable" description={state.error || 'This application could not be loaded.'} actionLabel={null} />;
  }

  const { application } = state;
  const profile = application.candidateProfile || {};
  const education = Array.isArray(profile.education)
    ? profile.education
        .map((item) => [item?.degree, item?.institution, item?.year].filter(Boolean).join(' · '))
        .filter(Boolean)
    : [];

  return (
    <>
      <Seo title="Candidate Details | Hirexo" description="Review a candidate profile and resume." />
      <DashboardHeader
        title={application.candidateUser?.name || 'Candidate Details'}
        description={`${application.job?.title || 'Application'} at ${application.job?.companyName || 'Hirexo employer'}`}
        actions={(
          <>
            <Badge tone={application.status === 'shortlisted' ? 'success' : 'neutral'}>{application.status || 'pending'}</Badge>
            {application.resumeSnapshot?.fileName ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  try {
                    const blob = await applicationsApi.downloadResume(application._id);
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank', 'noopener,noreferrer');
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                  } catch (error) {
                    toast.error(error.message || 'Unable to open resume.');
                  }
                }}
              >
                <Download size={15} /> Resume
              </Button>
            ) : null}
          </>
        )}
      />

      <div className="grid-2">
        <Card>
          <div className="panel-head">
            <h3><UserRound size={18} /> Candidate Snapshot</h3>
          </div>
          <div className="candidate-summary-points">
            <p><strong>Name:</strong> {application.candidateUser?.name || '-'}</p>
            <p><strong>Email:</strong> {application.candidateUser?.email || '-'}</p>
            <p><strong>Phone:</strong> {profile.phone || '-'}</p>
            <p><strong>Location:</strong> {profile.location || '-'}</p>
            <p><strong>Current Company:</strong> {profile.currentCompany || '-'}</p>
            <p><strong>Experience:</strong> {profile.experienceYears ?? 0} years</p>
          </div>
          <div className="tag-row mt-1">
            {(profile.skills || []).length
              ? profile.skills.map((skill) => <Badge key={skill}>{skill}</Badge>)
              : <Badge tone="neutral">No skills added</Badge>}
          </div>
        </Card>

        <Card>
          <div className="panel-head">
            <h3><BriefcaseBusiness size={18} /> Application Context</h3>
          </div>
          <div className="candidate-summary-points">
            <p><strong>Role:</strong> {application.job?.title || '-'}</p>
            <p><strong>Company:</strong> {application.job?.companyName || '-'}</p>
            <p><strong>Status:</strong> {application.status || '-'}</p>
            <p><strong>Applied:</strong> {formatDateTime(application.createdAt)}</p>
            <p><strong>Interview:</strong> {application.interviewScheduledAt ? formatDateTime(application.interviewScheduledAt) : 'Not scheduled'}</p>
            <p><strong>Resume:</strong> {application.resumeSnapshot?.fileName || 'Not attached'}</p>
          </div>
          {application.coverLetter ? (
            <>
              <h4 className="mt-1"><FileText size={16} /> Cover Letter</h4>
              <p>{application.coverLetter}</p>
            </>
          ) : null}
        </Card>
      </div>

      <div className="grid-2 mt-1">
        <Card>
          <div className="panel-head">
            <h3><FileText size={18} /> Professional Summary</h3>
          </div>
          <p>{profile.headline || 'No headline added.'}</p>
          <p>{profile.summary || 'Candidate has not added a summary yet.'}</p>
        </Card>

        <Card>
          <div className="panel-head">
            <h3><Mail size={18} /> Additional Details</h3>
          </div>
          <div className="candidate-summary-points">
            <p><strong><MapPin size={14} /> Location:</strong> {profile.location || '-'}</p>
            <p><strong><Phone size={14} /> Phone:</strong> {profile.phone || '-'}</p>
            <p><strong>Notes:</strong> {application.notes || 'No recruiter notes yet.'}</p>
          </div>
        </Card>
      </div>

      <Card className="mt-1">
        <div className="panel-head">
          <h3>Education</h3>
        </div>
        {renderList(education)}
      </Card>
    </>
  );
}
