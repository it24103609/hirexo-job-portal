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
      <DashboardHeader title={mode === 'edit' ? 'Edit Job' : 'Post New Job'} description="Jobs are submitted to admin review before public publishing." />
      <Card>
        <form className="form-grid" onSubmit={async (e) => {
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
          <Input label="Job title" value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} />
          <div className="grid-2">
            <Input label="Job image URL" type="url" placeholder="https://..." value={form.imageUrl} onChange={(e) => setForm((current) => ({ ...current, imageUrl: e.target.value }))} />
            <Input label="Image alt text" placeholder="Team collaboration" value={form.imageAlt} onChange={(e) => setForm((current) => ({ ...current, imageAlt: e.target.value }))} />
          </div>
          <div className="grid-2">
            <Input label="Salary min" type="number" value={form.salaryMin} onChange={(e) => setForm((current) => ({ ...current, salaryMin: e.target.value }))} />
            <Input label="Salary max" type="number" value={form.salaryMax} onChange={(e) => setForm((current) => ({ ...current, salaryMax: e.target.value }))} />
          </div>
          <div className="grid-2">
            <Select label="Category" value={form.category} onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))}>{[<option key="empty" value="">Select category</option>, ...categories.map((item) => <option key={item._id || item.slug} value={item._id || item.slug}>{item.name}</option>)]}</Select>
            <Select label="Industry" value={form.industry} onChange={(e) => setForm((current) => ({ ...current, industry: e.target.value }))}>{[<option key="empty" value="">Select industry</option>, ...industries.map((item) => <option key={item._id || item.slug} value={item._id || item.slug}>{item.name}</option>)]}</Select>
          </div>
          <div className="grid-2">
            <Select label="Location" value={form.location} onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))}>{[<option key="empty" value="">Select location</option>, ...locations.map((item) => <option key={item._id || item.slug} value={item._id || item.slug}>{item.name}</option>)]}</Select>
            <Select label="Job type" value={form.jobType} onChange={(e) => setForm((current) => ({ ...current, jobType: e.target.value }))}>{[<option key="empty" value="">Select job type</option>, ...jobTypes.map((item) => <option key={item._id || item.slug} value={item._id || item.slug}>{item.name}</option>)]}</Select>
          </div>
          <Input label="Experience level" value={form.experienceLevel} onChange={(e) => setForm((current) => ({ ...current, experienceLevel: e.target.value }))} />
          <Input label="Vacancies" type="number" value={form.vacancies} onChange={(e) => setForm((current) => ({ ...current, vacancies: e.target.value }))} />
          <Button type="submit">{mode === 'edit' ? 'Update job' : 'Submit job for review'}</Button>
        </form>
      </Card>
    </>
  );
}
