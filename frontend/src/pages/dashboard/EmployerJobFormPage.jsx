import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { employerApi } from '../../services/employer.api';
import { jobsApi } from '../../services/jobs.api';
import JobCard from '../../components/jobs/JobCard';
import { HIRING_PRIORITY_OPTIONS, SCREENING_QUESTION_TYPES } from '../../utils/applicationMeta';
import './EmployerJobFormPage.premium.css';

const createQuestion = () => ({
  question: '',
  type: 'text',
  required: false,
  options: '',
  idealAnswer: '',
  knockout: false
});

const empty = {
  title: '',
  description: '',
  imageUrl: '',
  imageAlt: '',
  salaryMin: '',
  salaryMax: '',
  location: '',
  category: '',
  jobType: '',
  industry: '',
  experienceLevel: '',
  vacancies: 1,
  responsibilitiesText: '',
  requirementsText: '',
  skillsText: '',
  tagsText: '',
  remoteFriendly: false,
  expiresAt: '',
  hiringPriority: 'medium',
  hiringLeadMember: '',
  collaboratorMembers: [],
  screeningQuestions: [createQuestion()]
};

function parseMultiline(value) {
  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCommaSeparated(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatQuestion(question = {}) {
  return {
    question: question.question || '',
    type: question.type || 'text',
    required: Boolean(question.required),
    options: Array.isArray(question.options) ? question.options.join(', ') : '',
    idealAnswer: question.idealAnswer || '',
    knockout: Boolean(question.knockout)
  };
}

export default function EmployerJobFormPage({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState(empty);
  const [submitMode, setSubmitMode] = useState('review');
  const [isSaving, setIsSaving] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const previewRef = useRef(null);

  useEffect(() => {
    employerApi.team()
      .then((res) => setTeamMembers(res.data || []))
      .catch(() => setTeamMembers([]));
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
          vacancies: job.vacancies || 1,
          responsibilitiesText: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : '',
          requirementsText: Array.isArray(job.requirements) ? job.requirements.join('\n') : '',
          skillsText: Array.isArray(job.skills) ? job.skills.join(', ') : '',
          tagsText: Array.isArray(job.tags) ? job.tags.join(', ') : '',
          remoteFriendly: Boolean(job.remoteFriendly),
          expiresAt: job.expiresAt ? new Date(job.expiresAt).toISOString().slice(0, 10) : '',
          hiringPriority: job.hiringPriority || 'medium',
          hiringLeadMember: job.hiringLeadMember?._id || job.hiringLeadMember || '',
          collaboratorMembers: Array.isArray(job.collaboratorMembers)
            ? job.collaboratorMembers.map((member) => member?._id || member).filter(Boolean)
            : [],
          screeningQuestions: Array.isArray(job.screeningQuestions) && job.screeningQuestions.length
            ? job.screeningQuestions.map(formatQuestion)
            : [createQuestion()]
        });
      }
    });
  }, [mode, id]);

  const scrollToPreview = () => {
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const updateQuestion = (index, key, value) => {
    setForm((current) => ({
      ...current,
      screeningQuestions: current.screeningQuestions.map((question, questionIndex) => (
        questionIndex === index ? { ...question, [key]: value } : question
      ))
    }));
  };

  const addQuestion = () => {
    setForm((current) => ({ ...current, screeningQuestions: [...current.screeningQuestions, createQuestion()] }));
  };

  const removeQuestion = (index) => {
    setForm((current) => ({
      ...current,
      screeningQuestions: current.screeningQuestions.filter((_, questionIndex) => questionIndex !== index) || [createQuestion()]
    }));
  };

  const screeningPreviewCount = form.screeningQuestions.filter((question) => question.question.trim()).length;

  return (
    <>
      <Seo title={`${mode === 'edit' ? 'Edit' : 'Create'} Job | Hirexo`} description="Create or edit a job post." />
      <DashboardHeader
        title={<span className="jobform-heading">{mode === 'edit' ? 'Edit Job' : 'Post New Job'}</span>}
        description={<span className="jobform-subtitle">Build a richer hiring brief with screening questions, team ownership, and structured job requirements.</span>}
        actions={(
          <div className="jobform-actions-row jobform-header-actions">
            <Button variant="secondary" type="button" onClick={scrollToPreview}>Preview Job</Button>
            <Button variant="ghost" type="submit" form="jobform-main" formNoValidate onClick={() => setSubmitMode('draft')} disabled={isSaving}>Save Draft</Button>
            <Button variant="primary" type="submit" form="jobform-main" onClick={() => setSubmitMode('review')} disabled={isSaving}>Submit for Review</Button>
          </div>
        )}
      />
      <div className="jobform-shell jobform-shell-premium">
        <div className="jobform-main jobform-main-premium">
          <div className="jobform-banner jobform-banner-premium">
            <span className="jobform-banner-title">Advanced hiring setup enabled</span>
            <span className="jobform-banner-desc">Use structured requirements, interview-ready screening questions, and team assignment so applicant review stays organized from day one.</span>
          </div>
          <form
            id="jobform-main"
            className="jobform-sectioned-form jobform-sectioned-form-premium"
            autoComplete="off"
            onSubmit={async (e) => {
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
                vacancies: Number(form.vacancies || 1),
                experienceLevel: form.experienceLevel,
                responsibilities: parseMultiline(form.responsibilitiesText),
                requirements: parseMultiline(form.requirementsText),
                skills: parseCommaSeparated(form.skillsText),
                tags: parseCommaSeparated(form.tagsText),
                remoteFriendly: Boolean(form.remoteFriendly),
                expiresAt: form.expiresAt || undefined,
                hiringPriority: form.hiringPriority,
                hiringLeadMember: form.hiringLeadMember || undefined,
                collaboratorMembers: form.collaboratorMembers,
                screeningQuestions: form.screeningQuestions
                  .map((question) => ({
                    ...question,
                    options: parseCommaSeparated(question.options)
                  }))
                  .filter((question) => question.question.trim())
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
            }}
          >
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
                <Textarea label="Responsibilities" value={form.responsibilitiesText} onChange={(e) => setForm((c) => ({ ...c, responsibilitiesText: e.target.value }))} placeholder="One responsibility per line" />
                <Textarea label="Requirements" value={form.requirementsText} onChange={(e) => setForm((c) => ({ ...c, requirementsText: e.target.value }))} placeholder="One requirement per line" />
                <div className="jobform-row jobform-row-2 jobform-row-premium">
                  <Input label="Core skills" value={form.skillsText} onChange={(e) => setForm((c) => ({ ...c, skillsText: e.target.value }))} placeholder="React, Node.js, MongoDB" />
                  <Input label="Tags" value={form.tagsText} onChange={(e) => setForm((c) => ({ ...c, tagsText: e.target.value }))} placeholder="urgent, backend, hybrid" />
                </div>
              </div>
            </Card>

            <Card className="jobform-section-card jobform-section-card-premium">
              <h2 className="jobform-section-title jobform-section-title-premium">Hiring Setup</h2>
              <div className="jobform-fields-grid jobform-fields-grid-premium">
                <div className="jobform-row jobform-row-2 jobform-row-premium">
                  <Select label="Hiring priority" value={form.hiringPriority} onChange={(e) => setForm((c) => ({ ...c, hiringPriority: e.target.value }))}>
                    {HIRING_PRIORITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </Select>
                  <Input label="Expiry date" type="date" value={form.expiresAt} onChange={(e) => setForm((c) => ({ ...c, expiresAt: e.target.value }))} />
                </div>
                <div className="jobform-row jobform-row-2 jobform-row-premium">
                  <Select label="Hiring lead" value={form.hiringLeadMember} onChange={(e) => setForm((c) => ({ ...c, hiringLeadMember: e.target.value }))}>
                    <option value="">No hiring lead yet</option>
                    {teamMembers.map((member) => <option key={member._id} value={member._id}>{member.name} · {member.title || 'Team member'}</option>)}
                  </Select>
                  <Select
                    label="Collaborators"
                    multiple
                    value={form.collaboratorMembers}
                    onChange={(e) => setForm((c) => ({
                      ...c,
                      collaboratorMembers: [...e.target.selectedOptions].map((option) => option.value)
                    }))}
                    className="jobform-multi-select"
                  >
                    {teamMembers.map((member) => <option key={member._id} value={member._id}>{member.name} · {member.title || 'Team member'}</option>)}
                  </Select>
                </div>
                <label className="checkbox-row">
                  <input type="checkbox" checked={form.remoteFriendly} onChange={(e) => setForm((c) => ({ ...c, remoteFriendly: e.target.checked }))} />
                  <span>Remote-friendly role</span>
                </label>
              </div>
            </Card>

            <Card className="jobform-section-card jobform-section-card-premium">
              <h2 className="jobform-section-title jobform-section-title-premium">Compensation</h2>
              <div className="jobform-fields-grid jobform-fields-grid-premium jobform-row-2 jobform-row-premium">
                <Input label="Salary min" type="number" min={0} value={form.salaryMin} onChange={(e) => setForm((c) => ({ ...c, salaryMin: e.target.value }))} placeholder="Minimum salary" prefix="Rs" className="jobform-salary-input jobform-salary-input-premium" />
                <Input label="Salary max" type="number" min={0} value={form.salaryMax} onChange={(e) => setForm((c) => ({ ...c, salaryMax: e.target.value }))} placeholder="Maximum salary" prefix="Rs" className="jobform-salary-input jobform-salary-input-premium" />
              </div>
              <div className="jobform-helper-text jobform-helper-text-premium">Enter the salary range for this role. Use LKR or Rs as appropriate.</div>
            </Card>

            <Card className="jobform-section-card jobform-section-card-premium">
              <div className="panel-head">
                <div>
                  <h2 className="jobform-section-title jobform-section-title-premium">Screening Questions</h2>
                  <p className="m-0">Collect structured answers before the candidate reaches your review pipeline.</p>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={addQuestion}>Add question</Button>
              </div>
              <div className="jobform-fields-grid jobform-fields-grid-premium">
                {form.screeningQuestions.map((question, index) => (
                  <Card key={`question-${index}`} className="jobform-question-card">
                    <div className="jobform-row jobform-row-2 jobform-row-premium">
                      <Input label={`Question ${index + 1}`} value={question.question} onChange={(e) => updateQuestion(index, 'question', e.target.value)} placeholder="e.g. How many years of React experience do you have?" />
                      <Select label="Type" value={question.type} onChange={(e) => updateQuestion(index, 'type', e.target.value)}>
                        {SCREENING_QUESTION_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </Select>
                    </div>
                    {question.type === 'select' ? (
                      <Input label="Options" value={question.options} onChange={(e) => updateQuestion(index, 'options', e.target.value)} placeholder="Yes, No, Maybe" />
                    ) : null}
                    <Input label="Ideal answer" value={question.idealAnswer} onChange={(e) => updateQuestion(index, 'idealAnswer', e.target.value)} placeholder="Optional reviewer hint" />
                    <div className="jobform-row jobform-row-2 jobform-row-premium">
                      <label className="checkbox-row">
                        <input type="checkbox" checked={question.required} onChange={(e) => updateQuestion(index, 'required', e.target.checked)} />
                        <span>Required question</span>
                      </label>
                      <label className="checkbox-row">
                        <input type="checkbox" checked={question.knockout} onChange={(e) => updateQuestion(index, 'knockout', e.target.checked)} />
                        <span>Knockout question</span>
                      </label>
                    </div>
                    {form.screeningQuestions.length > 1 ? (
                      <Button type="button" size="sm" variant="ghost" onClick={() => removeQuestion(index)}>Remove question</Button>
                    ) : null}
                  </Card>
                ))}
              </div>
            </Card>

            <Card className="jobform-section-card jobform-section-card-premium">
              <h2 className="jobform-section-title jobform-section-title-premium">Branding & Media</h2>
              <div className="jobform-fields-grid jobform-fields-grid-premium jobform-row-2 jobform-row-premium">
                <Input label="Job image URL" type="url" placeholder="https://..." value={form.imageUrl} onChange={(e) => setForm((c) => ({ ...c, imageUrl: e.target.value }))} />
                <Input label="Image alt text" placeholder="Team collaboration" value={form.imageAlt} onChange={(e) => setForm((c) => ({ ...c, imageAlt: e.target.value }))} />
              </div>
              <div className="jobform-helper-text jobform-helper-text-premium">Add a relevant image to make your job post stand out.</div>
            </Card>

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
          <Card className="mt-1">
            <div className="panel-head">
              <h3 style={{ margin: 0 }}>Hiring summary</h3>
            </div>
            <p className="m-0">Priority: <strong>{form.hiringPriority}</strong></p>
            <p className="m-0">Remote-friendly: <strong>{form.remoteFriendly ? 'Yes' : 'No'}</strong></p>
            <p className="m-0">Screening questions: <strong>{screeningPreviewCount}</strong></p>
            <p className="m-0">Hiring lead: <strong>{teamMembers.find((member) => member._id === form.hiringLeadMember)?.name || 'Not assigned'}</strong></p>
          </Card>
        </aside>
      </div>
    </>
  );
}
