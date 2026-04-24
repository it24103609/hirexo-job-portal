import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Seo from '../../components/ui/Seo';
import SectionHeader from '../../components/ui/SectionHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import JobApplicationForm from '../../components/jobs/JobApplicationForm';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { jobsApi } from '../../services/jobs.api';
import { applicationsApi } from '../../services/applications.api';
import { candidateApi } from '../../services/candidate.api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

function getLabel(value, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value.name || value.slug || fallback;
}

export default function JobDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, profile } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [resumeReady, setResumeReady] = useState(Boolean(profile?.resume?.filePath));
  const [resumeChecked, setResumeChecked] = useState(false);
  const imageUrl = job?.image?.url || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=700&fit=crop';

  useEffect(() => {
    setLoading(true);
    setLoadError('');
    jobsApi.getBySlug(slug)
      .then((res) => setJob(res.data || null))
      .catch((error) => {
        setJob(null);
        setLoadError(error.message || 'The requested job could not be loaded.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'candidate' || !job?._id) return;

    applicationsApi.mine()
      .then((res) => {
        const applications = res.data || [];
        const matched = applications.some((application) => String(application.job?._id || application.job) === String(job._id));
        setAlreadyApplied(matched);
      })
      .catch(() => setAlreadyApplied(false));
  }, [isAuthenticated, user?.role, job?._id]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'candidate') return;

    if (profile?.resume?.filePath) {
      setResumeReady(true);
      setResumeChecked(true);
      return;
    }

    candidateApi.getResume()
      .then((res) => {
        setResumeReady(Boolean(res.data?.filePath));
      })
      .catch(() => {
        setResumeReady(false);
      })
      .finally(() => setResumeChecked(true));
  }, [isAuthenticated, user?.role, profile?.resume?.filePath]);

  if (loading) return <Loader label="Loading job details..." />;
  if (!job) return <EmptyState title="Job not found" description={loadError || 'The requested job is unavailable.'} actionLabel="Back to jobs" actionTo="/jobs" />;

  const canApply = isAuthenticated && user?.role === 'candidate' && !alreadyApplied && resumeReady;

  return (
    <>
      <Seo
        title={`${job.title} | Hirexo`}
        description={job.description || 'Job details page'}
        image={imageUrl}
        type="article"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: job.title,
          description: job.description || 'Job details page',
          datePosted: job.createdAt,
          hiringOrganization: {
            '@type': 'Organization',
            name: job.companyName || 'Hirexo'
          },
          employmentType: getLabel(job.jobType, 'Full-time'),
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: getLabel(job.location, 'Remote')
            }
          },
          baseSalary: job.salaryMin || job.salaryMax
            ? {
                '@type': 'MonetaryAmount',
                currency: 'LKR',
                value: {
                  '@type': 'QuantitativeValue',
                  minValue: job.salaryMin,
                  maxValue: job.salaryMax,
                  unitText: 'YEAR'
                }
              }
            : undefined,
          image: imageUrl
        }}
      />
      <section className="section-block">
        <div className="shell grid-2">
          <Card>
            <SectionHeader eyebrow="Job details" title={job.title} description={job.companyName} />
            <div className="job-detail-image">
              <img src={imageUrl} alt={job.image?.alt || job.title} loading="eager" />
            </div>
            <div className="tag-row mb-1">
              <Badge tone="success">{getLabel(job.jobType, 'Full-time')}</Badge>
              <Badge>{getLabel(job.location, 'Remote')}</Badge>
              <Badge>{job.salary || 'Competitive salary'}</Badge>
            </div>
            <p>{job.description || 'This role focuses on building a strong and scalable recruitment workflow.'}</p>
            {alreadyApplied ? (
              <Badge tone="success">You have already applied for this job</Badge>
            ) : isAuthenticated && user?.role === 'candidate' && !resumeChecked ? (
              <p>Checking your resume status...</p>
            ) : isAuthenticated && user?.role === 'candidate' && resumeChecked && !resumeReady ? (
              <div className="form-links">
                <p>Please upload your resume before applying to jobs.</p>
                <Button onClick={() => navigate('/candidate/resume')}>Upload resume</Button>
              </div>
            ) : !canApply ? (
              <div className="form-links">
                <Button onClick={() => navigate('/candidate/login')}>Candidate login to apply</Button>
                <Button as="a" href="/candidate/register" variant="secondary">Create candidate account</Button>
              </div>
            ) : (
              <JobApplicationForm
                screeningQuestions={job.screeningQuestions || []}
                onSubmit={async (values) => {
                  try {
                    await applicationsApi.apply({
                      jobId: job._id || job.id || slug,
                      coverLetter: values.coverLetter,
                      candidateSource: values.candidateSource,
                      screeningAnswers: values.screeningAnswers || []
                    });
                    toast.success('Application submitted');
                    setAlreadyApplied(true);
                  } catch (error) {
                    toast.error(error.message || 'Failed to submit application');
                    if ((error.message || '').toLowerCase().includes('resume')) {
                      navigate('/candidate/resume');
                    }
                  }
                }}
              />
            )}
          </Card>
          <Card>
            <SectionHeader eyebrow="Requirements" title="Who should apply" />
            <ul className="detail-list">
              {(job.requirements || ['Relevant experience', 'Strong communication', 'Hands-on ownership']).map((item) => <li key={item}>{item}</li>)}
            </ul>
            <SectionHeader eyebrow="Responsibilities" title="What the role needs" />
            <ul className="detail-list">
              {(job.responsibilities || ['Build, review, and ship quality work']).map((item) => <li key={item}>{item}</li>)}
            </ul>
          </Card>
        </div>
      </section>
    </>
  );
}
