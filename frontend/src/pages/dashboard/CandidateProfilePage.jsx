import { useEffect, useState } from 'react';
import { CircleUserRound, FileText, BriefcaseBusiness, Save, RotateCcw } from 'lucide-react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import { candidateApi } from '../../services/candidate.api';
import { toast } from 'react-toastify';
import Loader from '../../components/ui/Loader';

function buildCompletion(form) {
  const checks = [
    Boolean(form.headline?.trim()),
    Boolean(form.summary?.trim()),
    Boolean(form.phone?.trim()),
    Boolean(form.location?.trim()),
    Boolean(form.skills?.trim()),
    Boolean(form.experienceYears)
  ];
  return Math.max(20, Math.round((checks.filter(Boolean).length / checks.length) * 100));
}

export default function CandidateProfilePage() {
  const [form, setForm] = useState({ headline: '', summary: '', phone: '', location: '', skills: '', experienceYears: '' });
  const [initialForm, setInitialForm] = useState({ headline: '', summary: '', phone: '', location: '', skills: '', experienceYears: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    candidateApi.profile().then((res) => {
      const profile = res.data || {};
      const nextForm = {
        headline: profile.headline || '',
        summary: profile.summary || '',
        phone: profile.phone || '',
        location: profile.location || '',
        skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
        experienceYears: profile.experienceYears || ''
      };
      setForm(nextForm);
      setInitialForm(nextForm);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading profile..." />;

  const completion = buildCompletion(form);
  const skillChips = form.skills
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <>
      <Seo title="Candidate Profile | Hirexo" description="Create and update your candidate profile." />
      <DashboardHeader title="My Profile" description="Keep your profile complete to improve shortlisting chances." />

      <Card className="candidate-profile-summary-card">
        <div className="panel-head">
          <h3><CircleUserRound size={18} /> Profile summary</h3>
          <strong className="candidate-completion-label">{completion}% complete</strong>
        </div>
        <div className="candidate-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completion}>
          <span style={{ width: `${completion}%` }} />
        </div>
        <div className="candidate-summary-points">
          <p><strong>Headline:</strong> {form.headline ? 'Added' : 'Missing'}</p>
          <p><strong>Summary:</strong> {form.summary ? 'Added' : 'Missing'}</p>
          <p><strong>Skills:</strong> {skillChips.length ? `${skillChips.length} listed` : 'Missing'}</p>
          <p><strong>Experience:</strong> {form.experienceYears || 0} years</p>
        </div>
      </Card>

      <Card className="candidate-profile-form-card mt-1">
        <form className="form-grid" onSubmit={async (e) => {
          e.preventDefault();
          await candidateApi.saveProfile({
            ...form,
            experienceYears: Number(form.experienceYears || 0),
            skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean)
          });
          setInitialForm(form);
          toast.success('Profile saved');
        }}>
          <section className="candidate-form-section">
            <div className="candidate-form-title">
              <h3><CircleUserRound size={16} /> Basic information</h3>
              <p>Add your core details so recruiters can understand your background quickly.</p>
            </div>
            <div className="grid-2">
              <Input label="Phone" value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} placeholder="+94 77 000 0000" />
              <Input label="Location" value={form.location} onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))} placeholder="Colombo / Remote" />
            </div>
            <Input label="Headline" value={form.headline} onChange={(e) => setForm((current) => ({ ...current, headline: e.target.value }))} placeholder="Senior Frontend Developer | React Specialist" />
          </section>

          <section className="candidate-form-section">
            <div className="candidate-form-title">
              <h3><FileText size={16} /> Professional summary</h3>
              <p>Share your strengths, impact, and the type of roles you are targeting.</p>
            </div>
            <Textarea label="Summary" value={form.summary} onChange={(e) => setForm((current) => ({ ...current, summary: e.target.value }))} placeholder="I build scalable, high-performing interfaces and collaborate closely with product teams..." />
          </section>

          <section className="candidate-form-section">
            <div className="candidate-form-title">
              <h3><BriefcaseBusiness size={16} /> Skills and experience</h3>
              <p>Use comma-separated skills and add your total professional experience.</p>
            </div>
            <Input label="Skills" value={form.skills} onChange={(e) => setForm((current) => ({ ...current, skills: e.target.value }))} placeholder="Node.js, MongoDB, React" />
            {skillChips.length ? (
              <div className="candidate-skill-chip-row">
                {skillChips.map((skill) => <span key={skill} className="candidate-skill-chip">{skill}</span>)}
              </div>
            ) : null}
            <Input label="Experience years" type="number" value={form.experienceYears} onChange={(e) => setForm((current) => ({ ...current, experienceYears: e.target.value }))} min="0" />
          </section>

          <div className="candidate-form-actions-bar">
            <Button type="button" variant="ghost" onClick={() => setForm(initialForm)}>
              <RotateCcw size={16} /> Reset changes
            </Button>
            <Button type="submit">
              <Save size={16} /> Save profile
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
