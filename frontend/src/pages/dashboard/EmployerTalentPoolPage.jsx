import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import { employerApi } from '../../services/employer.api';
import { TALENT_STAGE_OPTIONS } from '../../utils/applicationMeta';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  location: '',
  headline: '',
  currentCompany: '',
  experienceYears: '',
  skills: '',
  tags: '',
  notes: '',
  stage: 'new'
};

export default function EmployerTalentPoolPage() {
  const [loading, setLoading] = useState(true);
  const [talent, setTalent] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [form, setForm] = useState(emptyForm);

  const loadTalent = async (nextKeyword = keyword) => {
    setLoading(true);
    try {
      const res = await employerApi.talentPool({ keyword: nextKeyword });
      setTalent(res.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load talent pool');
      setTalent([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTalent('');
  }, []);

  if (loading) return <Loader label="Loading talent pool..." />;

  return (
    <>
      <Seo title="Talent Pool | Hirexo" description="Manage saved candidates, warm leads, and future-fit profiles." />
      <DashboardHeader title="Talent Pool" description="Save promising applicants, add manual leads, and keep future-fit candidates warm." />

      <div className="grid-2">
        <Card>
          <div className="panel-head">
            <div>
              <p className="section-eyebrow">Search</p>
              <h3>Find saved candidates</h3>
            </div>
            <Badge tone="success">{talent.length} profiles</Badge>
          </div>
          <div className="dashboard-actions">
            <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search by name, skill, tag, or email" />
            <Button variant="secondary" onClick={async () => { await loadTalent(keyword); }}>Search</Button>
          </div>
          <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            {talent.length ? talent.map((item) => (
              <article key={item._id} className="card">
                <div className="panel-head" style={{ marginBottom: 8 }}>
                  <div>
                    <strong>{item.name}</strong>
                    <p className="m-0">{item.email || 'No email'} {item.currentCompany ? `· ${item.currentCompany}` : ''}</p>
                  </div>
                  <Badge>{item.stage}</Badge>
                </div>
                <p className="m-0">{item.headline || 'Headline not added'}</p>
                <div className="tag-row mt-1">
                  {(item.skills || []).slice(0, 5).map((skill) => <Badge key={skill} tone="neutral">{skill}</Badge>)}
                  {(item.tags || []).slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}
                </div>
                <div className="dashboard-actions mt-1">
                  <Select value={item.stage} onChange={async (e) => {
                    await employerApi.updateTalent(item._id, { ...item, stage: e.target.value });
                    await loadTalent(keyword);
                  }}>
                    {TALENT_STAGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </Select>
                </div>
              </article>
            )) : <p className="m-0">No saved talent yet. Add leads manually or push candidates from the applicants board.</p>}
          </div>
        </Card>

        <Card>
          <div className="panel-head">
            <div>
              <p className="section-eyebrow">Manual entry</p>
              <h3>Add candidate to CRM</h3>
            </div>
          </div>
          <div className="form-grid">
            <Input label="Candidate name" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
            <div className="grid-2">
              <Input label="Email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} />
              <Input label="Phone" value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} />
            </div>
            <div className="grid-2">
              <Input label="Location" value={form.location} onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))} />
              <Input label="Current company" value={form.currentCompany} onChange={(e) => setForm((current) => ({ ...current, currentCompany: e.target.value }))} />
            </div>
            <Input label="Headline" value={form.headline} onChange={(e) => setForm((current) => ({ ...current, headline: e.target.value }))} />
            <div className="grid-2">
              <Input label="Experience years" type="number" value={form.experienceYears} onChange={(e) => setForm((current) => ({ ...current, experienceYears: e.target.value }))} />
              <Select label="Stage" value={form.stage} onChange={(e) => setForm((current) => ({ ...current, stage: e.target.value }))}>
                {TALENT_STAGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </Select>
            </div>
            <Input label="Skills" value={form.skills} onChange={(e) => setForm((current) => ({ ...current, skills: e.target.value }))} placeholder="React, Node.js, Communication" />
            <Input label="Tags" value={form.tags} onChange={(e) => setForm((current) => ({ ...current, tags: e.target.value }))} placeholder="silver medalist, referral" />
            <Textarea label="Notes" value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} placeholder="Why should we keep this candidate warm?" />
            <div className="dashboard-actions">
              <Button onClick={async () => {
                await employerApi.createTalent(form);
                toast.success('Talent profile added');
                setForm(emptyForm);
                await loadTalent(keyword);
              }}>
                Save to talent pool
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
