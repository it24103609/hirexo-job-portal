import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import { employerApi } from '../../services/employer.api';
import { jobsApi } from '../../services/jobs.api';
import { toast } from 'react-toastify';
import JobCard from '../../components/jobs/JobCard';
import './EmployerJobFormPage.premium.css';

const empty = { title: '', description: '', imageUrl: '', imageAlt: '', salaryMin: '', salaryMax: '', location: '', category: '', jobType: '', industry: '', experienceLevel: '', vacancies: 1 };

export default function EmployerJobFormPage({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(empty);
  const [submitMode, setSubmitMode] = useState('review');
  const [isSaving, setIsSaving] = useState(false);
  const previewRef = useRef(null);

  useEffect(() => {
    if (mode !== 'edit' || !id) return;
    employerApi.jobs().then((res) => {
      const job = (res.data || []).find((item) => String(item._id) === String(id));
      if (job) {
        setForm({
          title: job.title || '',
          description: job.description || '',
          imageUrl: job.image?.url || '',
          imageAlt: job.image?.alt || '',
          salaryMin: job.salaryMin || '',
          salaryMax: job.salaryMax || '',
          location: job.location?._id || job.location || '',
          category: job.category?._id || job.category || '',
          jobType: job.jobType?._id || job.jobType || '',
          industry: job.industry?._id || job.industry || '',
          experienceLevel: job.experienceLevel || '',
          vacancies: job.vacancies || 1
        });
      }
    });
  }, [mode, id]);

  const scrollToPreview = () => {
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Seo title={`${mode === 'edit' ? 'Edit' : 'Create'} Job | Hirexo`} description="Create or edit a job post." />
      <DashboardHeader
        title={<span className="jobform-heading">{mode === 'edit' ? 'Edit Job' : 'Post New Job'}</span>}
        description={<span className="jobform-subtitle">Post a new opening. Jobs are reviewed by admin before publishing.</span>}
        actions={
          <div className="jobform-actions-row jobform-header-actions">
            <Button variant="secondary" type="button" onClick={scrollToPreview}>Preview Job</Button>
            <Button variant="ghost" type="submit" form="jobform-main" formNoValidate onClick={() => setSubmitMode('draft')} disabled={isSaving}>Save Draft</Button>
            <Button variant="primary" type="submit" form="jobform-main" onClick={() => setSubmitMode('review')} disabled={isSaving}>Submit for Review</Button>
          </div>
        }
      />
      <div className="jobform-shell jobform-shell-premium">
        <div className="jobform-main jobform-main-premium">
          <div className="jobform-banner jobform-banner-premium">
            <span className="jobform-banner-title">Jobs are reviewed before publishing</span>
            <span className="jobform-banner-desc">All job posts are reviewed by Hirexo admin for quality and compliance before going live. You will be notified once your job is approved.</span>
          </div>
          <form id="jobform-main" className="jobform-sectioned-form jobform-sectioned-form-premium" autoComplete="off" onSubmit={async (e) => {
            e.preventDefault();

            const category = String(form.category || '').trim();
            const industry = String(form.industry || '').trim();
            const jobType = String(form.jobType || '').trim();
            const location = String(form.location || '').trim();
            const title = String(form.title || '').trim();
            const description = String(form.description || '').trim();
            const isDraft = submitMode === 'draft';

            if (!title || !description) {
              toast.error('Job title and description are required.');
              return;
            }

            if (!isDraft && (!category || !industry || !jobType || !location)) {
              toast.error('Category, Industry, Job Type, and Location are required.');
              return;
            }

            const payload = {
              ...form,
              title,
              description,
              category,
              industry,
              jobType,
              location,
              saveAsDraft: isDraft,
              image: form.imageUrl.trim() ? {
                url: form.imageUrl.trim(),
                alt: form.imageAlt.trim() || form.title || 'Job image'
              } : undefined,
              salaryMin: Number(form.salaryMin || 0),
              salaryMax: Number(form.salaryMax || 0),
              vacancies: Number(form.vacancies || 1)
            };

            try {
              setIsSaving(true);
              if (mode === 'edit' && id) {
                await jobsApi.update(id, payload);
                toast.success(isDraft ? 'Draft saved' : 'Job updated');
              } else {
                await jobsApi.create(payload);
                toast.success(isDraft ? 'Draft saved' : 'Job submitted for review');
              }
              navigate('/employer/jobs');
            } finally {
              setIsSaving(false);
            }
          }}>
            {/* Job Basics */}
            <Card className="jobform-section-card jobform-section-card-premium">
              <h2 className="jobform-section-title jobform-section-title-premium">Job Basics</h2>
              <div className="jobform-fields-grid jobform-fields-grid-premium">
                <Input label="Job title" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} placeholder="e.g. Senior Software Engineer" required />
                <div className="jobform-row jobform-row-2 jobform-row-premium">
                  <Input label="Category" value={form.category} onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))} placeholder="e.g. Engineering" />
                  <Input label="Industry" value={form.industry} onChange={(e) => setForm((c) => ({ ...c, industry: e.target.value }))} placeholder="e.g. Information Technology" />
                </div>
                <div className="jobform-row jobform-row-2 jobform-row-premium">
                  <Input label="Job type" value={form.jobType} onChange={(e) => setForm((c) => ({ ...c, jobType: e.target.value }))} placeholder="e.g. Full-time" />
                  <Input label="Location" value={form.location} onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} placeholder="e.g. Colombo" />
                </div>
              </div>
            </Card>
            {/* Job Details */}
            <Card className="jobform-section-card jobform-section-card-premium">
              <h2 className="jobform-section-title jobform-section-title-premium">Job Details</h2>
              <div className="jobform-fields-grid jobform-fields-grid-premium">
                <Textarea
                  label="Description"
                  value={form.description}
                  onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                  placeholder="Describe the role, responsibilities, and ideal candidate."
                  className="jobform-description-textarea jobform-description-textarea-premium"
                  required
                />
                <div className="jobform-helper-text jobform-helper-text-premium">Write a clear, engaging job description. Highlight key responsibilities, required skills, and what makes your company unique.</div>
                <div className="jobform-row jobform-row-2 jobform-row-premium">
                  <Input label="Experience level" value={form.experienceLevel} onChange={(e) => setForm((c) => ({ ...c, experienceLevel: e.target.value }))} placeholder="e.g. 3+ years, Mid-Senior" />
                  <Input label="Vacancies" type="number" min={1} value={form.vacancies} onChange={(e) => setForm((c) => ({ ...c, vacancies: e.target.value }))} placeholder="Number of openings" />
                </div>
              </div>
            </Card>
            {/* Compensation */}
            <Card className="jobform-section-card jobform-section-card-premium">
              <h2 className="jobform-section-title jobform-section-title-premium">Compensation</h2>
              <div className="jobform-fields-grid jobform-fields-grid-premium jobform-row-2 jobform-row-premium">
                <Input
                  label="Salary min"
                  type="number"
                  min={0}
                  value={form.salaryMin}
                  onChange={(e) => setForm((c) => ({ ...c, salaryMin: e.target.value }))}
                  placeholder="Minimum salary"
                  prefix="Rs"
                  className="jobform-salary-input jobform-salary-input-premium"
                />
                <Input
                  label="Salary max"
                  type="number"
                  min={0}
                  value={form.salaryMax}
                  onChange={(e) => setForm((c) => ({ ...c, salaryMax: e.target.value }))}
                  placeholder="Maximum salary"
                  prefix="Rs"
                  className="jobform-salary-input jobform-salary-input-premium"
                />
              </div>
              <div className="jobform-helper-text jobform-helper-text-premium">Enter the salary range for this role. Use LKR or Rs as appropriate.</div>
            </Card>
            {/* Branding & Media */}
            <Card className="jobform-section-card jobform-section-card-premium">
              <h2 className="jobform-section-title jobform-section-title-premium">Branding & Media</h2>
              <div className="jobform-fields-grid jobform-fields-grid-premium jobform-row-2 jobform-row-premium">
                <Input label="Job image URL" type="url" placeholder="https://..." value={form.imageUrl} onChange={(e) => setForm((c) => ({ ...c, imageUrl: e.target.value }))} />
                <Input label="Image alt text" placeholder="Team collaboration" value={form.imageAlt} onChange={(e) => setForm((c) => ({ ...c, imageAlt: e.target.value }))} />
              </div>
              <div className="jobform-helper-text jobform-helper-text-premium">Add a relevant image to make your job post stand out.</div>
            </Card>
            {/* Bottom Actions */}
            <div className="jobform-actions-row jobform-actions-bottom jobform-actions-bottom-premium">
              <Button variant="ghost" type="button" onClick={() => navigate('/employer/jobs')}>Cancel</Button>
              <Button variant="secondary" type="button" onClick={scrollToPreview}>Preview Job</Button>
              <Button variant="ghost" type="submit" formNoValidate onClick={() => setSubmitMode('draft')} disabled={isSaving}>Save Draft</Button>
              <Button variant="primary" type="submit" className="jobform-submit-btn-premium" onClick={() => setSubmitMode('review')} disabled={isSaving}>
                {isSaving ? 'Saving...' : mode === 'edit' ? 'Update job' : 'Submit for Review'}
              </Button>
            </div>
          </form>
        </div>
        {/* Sticky Preview */}
        <aside ref={previewRef} className="jobform-preview-sticky jobform-preview-sticky-premium">
          <div className="jobform-preview-label jobform-preview-label-premium">Live Preview</div>
          <JobCard
            job={{
              title: form.title || 'Job Title',
              companyName: 'Your Company',
              location: form.location || 'Location',
              jobType: form.jobType || 'Job Type',
              experienceLevel: form.experienceLevel,
              salaryMin: form.salaryMin,
              salaryMax: form.salaryMax,
              image: form.imageUrl ? { url: form.imageUrl, alt: form.imageAlt } : undefined,
              description: form.description,
              vacancies: form.vacancies
            }}
            variant="list"
          />
        </aside>
      </div>
    </>
  );
}
