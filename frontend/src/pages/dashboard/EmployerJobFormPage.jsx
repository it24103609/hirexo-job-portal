import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { employerApi } from '../../services/employer.api';
import { jobsApi } from '../../services/jobs.api';
import { masterDataApi } from '../../services/masterData.api';
import { toast } from 'react-toastify';
import JobCard from '../../components/jobs/JobCard';
import './EmployerJobFormPage.premium.css';

const empty = { title: '', description: '', imageUrl: '', imageAlt: '', salaryMin: '', salaryMax: '', location: '', category: '', jobType: '', industry: '', experienceLevel: '', vacancies: 1 };

const objectIdPattern = /^[a-f\d]{24}$/i;

function resolveMasterDataId(value, items = []) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (objectIdPattern.test(raw)) return raw;

  const match = items.find((item) => {
    const id = String(item?._id || '').trim();
    const slug = String(item?.slug || '').trim().toLowerCase();
    const name = String(item?.name || '').trim().toLowerCase();
    const probe = raw.toLowerCase();
    return (id && id === raw) || slug === probe || name === probe;
  });

  return String(match?._id || '').trim();
}

export default function EmployerJobFormPage({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [industries, setIndustries] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      masterDataApi.listPublic('categories'),
      masterDataApi.listPublic('locations'),
      masterDataApi.listPublic('job-types'),
      masterDataApi.listPublic('industries')
    ]).then(([cats, locs, types, inds]) => {
      setCategories(cats.status === 'fulfilled' ? cats.value.data || [] : []);
      setLocations(locs.status === 'fulfilled' ? locs.value.data || [] : []);
      setJobTypes(types.status === 'fulfilled' ? types.value.data || [] : []);
      setIndustries(inds.status === 'fulfilled' ? inds.value.data || [] : []);
    });
  }, []);

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

  return (
    <>
      <Seo title={`${mode === 'edit' ? 'Edit' : 'Create'} Job | Hirexo`} description="Create or edit a job post." />
      <DashboardHeader
        title={<span className="jobform-heading">{mode === 'edit' ? 'Edit Job' : 'Post New Job'}</span>}
        description={<span className="jobform-subtitle">Post a new opening. Jobs are reviewed by admin before publishing.</span>}
        actions={
          <div className="jobform-actions-row jobform-header-actions">
            <Button variant="ghost" type="button">Save Draft</Button>
            <Button variant="secondary" type="button">Preview Job</Button>
            <Button variant="primary" type="submit" form="jobform-main">Submit for Review</Button>
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
            const locationId = resolveMasterDataId(form.location, locations);
            const jobTypeId = resolveMasterDataId(form.jobType, jobTypes);
            if (!locationId || !jobTypeId) {
              toast.error('Please select valid Location and Job Type from master data.');
              return;
            }
            const payload = {
              ...form,
              image: form.imageUrl.trim() ? {
                url: form.imageUrl.trim(),
                alt: form.imageAlt.trim() || form.title || 'Job image'
              } : undefined,
              location: locationId,
              jobType: jobTypeId,
              salaryMin: Number(form.salaryMin || 0),
              salaryMax: Number(form.salaryMax || 0),
              vacancies: Number(form.vacancies || 1)
            };
            if (mode === 'edit' && id) {
              await jobsApi.update(id, payload);
              toast.success('Job updated');
            } else {
              await jobsApi.create(payload);
              toast.success('Job submitted for review');
            }
            navigate('/employer/jobs');
          }}>
            {/* Job Basics */}
            <Card className="jobform-section-card jobform-section-card-premium">
              <h2 className="jobform-section-title jobform-section-title-premium">Job Basics</h2>
              <div className="jobform-fields-grid jobform-fields-grid-premium">
                <Input label="Job title" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} placeholder="e.g. Senior Software Engineer" required />
                <div className="jobform-row jobform-row-2 jobform-row-premium">
                  <Select label="Category" value={form.category} onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))} required>{[<option key="empty" value="">Select category</option>, ...categories.map((item) => <option key={item._id || item.slug} value={item._id || item.slug}>{item.name}</option>)]}</Select>
                  <Select label="Industry" value={form.industry} onChange={(e) => setForm((c) => ({ ...c, industry: e.target.value }))} required>{[<option key="empty" value="">Select industry</option>, ...industries.map((item) => <option key={item._id || item.slug} value={item._id || item.slug}>{item.name}</option>)]}</Select>
                </div>
                <div className="jobform-row jobform-row-2 jobform-row-premium">
                  <Select label="Job type" value={form.jobType} onChange={(e) => setForm((c) => ({ ...c, jobType: e.target.value }))} required>{[<option key="empty" value="">Select job type</option>, ...jobTypes.map((item) => <option key={item._id || item.slug} value={item._id || item.slug}>{item.name}</option>)]}</Select>
                  <Select label="Location" value={form.location} onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} required>{[<option key="empty" value="">Select location</option>, ...locations.map((item) => <option key={item._id || item.slug} value={item._id || item.slug}>{item.name}</option>)]}</Select>
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
                  <Input label="Experience level" value={form.experienceLevel} onChange={(e) => setForm((c) => ({ ...c, experienceLevel: e.target.value }))} placeholder="e.g. 3+ years, Mid-Senior" required />
                  <Input label="Vacancies" type="number" min={1} value={form.vacancies} onChange={(e) => setForm((c) => ({ ...c, vacancies: e.target.value }))} placeholder="Number of openings" required />
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
                  required
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
                  required
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
              <Button variant="ghost" type="button">Save Draft</Button>
              <Button variant="primary" type="submit" className="jobform-submit-btn-premium">{mode === 'edit' ? 'Update job' : 'Submit for Review'}</Button>
            </div>
          </form>
        </div>
        {/* Sticky Preview */}
        <aside className="jobform-preview-sticky jobform-preview-sticky-premium">
          <div className="jobform-preview-label jobform-preview-label-premium">Live Preview</div>
          <JobCard
            job={{
              title: form.title || 'Job Title',
              companyName: 'Your Company',
              location: locations.find(l => l._id === form.location)?.name || 'Location',
              jobType: jobTypes.find(j => j._id === form.jobType)?.name || 'Job Type',
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
