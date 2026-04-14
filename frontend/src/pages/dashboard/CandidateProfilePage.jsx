import { useEffect, useState } from 'react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import { candidateApi } from '../../services/candidate.api';
import { toast } from 'react-toastify';

export default function CandidateProfilePage() {
  const [form, setForm] = useState({ headline: '', summary: '', phone: '', location: '', skills: '', experienceYears: '' });

  useEffect(() => {
    candidateApi.profile().then((res) => {
      const profile = res.data || {};
      setForm({
        headline: profile.headline || '',
        summary: profile.summary || '',
        phone: profile.phone || '',
        location: profile.location || '',
        skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
        experienceYears: profile.experienceYears || ''
      });
    }).catch(() => {});
  }, []);

  return (
    <>
      <Seo title="Candidate Profile | Hirexo" description="Create and update your candidate profile." />
      <DashboardHeader title="My Profile" description="Keep your profile complete to improve shortlisting chances." />
      <Card>
        <form className="form-grid" onSubmit={async (e) => {
          e.preventDefault();
          await candidateApi.saveProfile({
            ...form,
            experienceYears: Number(form.experienceYears || 0),
            skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean)
          });
          toast.success('Profile saved');
        }}>
          <Input label="Headline" value={form.headline} onChange={(e) => setForm((current) => ({ ...current, headline: e.target.value }))} />
          <Textarea label="Summary" value={form.summary} onChange={(e) => setForm((current) => ({ ...current, summary: e.target.value }))} />
          <div className="grid-2">
            <Input label="Phone" value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} />
            <Input label="Location" value={form.location} onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))} />
          </div>
          <Input label="Skills" value={form.skills} onChange={(e) => setForm((current) => ({ ...current, skills: e.target.value }))} placeholder="Node.js, MongoDB, React" />
          <Input label="Experience years" type="number" value={form.experienceYears} onChange={(e) => setForm((current) => ({ ...current, experienceYears: e.target.value }))} />
          <Button type="submit">Save profile</Button>
        </form>
      </Card>
    </>
  );
}
