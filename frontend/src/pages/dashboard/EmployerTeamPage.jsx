import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { employerApi } from '../../services/employer.api';

const permissions = ['jobs', 'applicants', 'messages', 'offers', 'analytics'];
const emptyForm = { name: '', email: '', title: '', notes: '', permissions: ['jobs', 'applicants'], status: 'active' };

export default function EmployerTeamPage() {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const loadTeam = async () => {
    setLoading(true);
    try {
      const res = await employerApi.team();
      setTeam(res.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load hiring team');
      setTeam([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  if (loading) return <Loader label="Loading hiring team..." />;

  return (
    <>
      <Seo title="Hiring Team | Hirexo" description="Coordinate your internal hiring collaborators from one place." />
      <DashboardHeader title="Hiring Team" description="Track recruiters, interviewers, and approvers who support your hiring workflow." />
      <div className="grid-2">
        <Card>
          <div className="panel-head">
            <div>
              <p className="section-eyebrow">Team directory</p>
              <h3>Collaborators</h3>
            </div>
            <Badge tone="success">{team.length} members</Badge>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {team.length ? team.map((member) => (
              <article key={member._id} className="card">
                <div className="panel-head" style={{ marginBottom: 8 }}>
                  <div>
                    <strong>{member.name}</strong>
                    <p className="m-0">{member.email} {member.title ? `· ${member.title}` : ''}</p>
                  </div>
                  <Badge tone={member.status === 'active' ? 'success' : 'neutral'}>{member.status}</Badge>
                </div>
                <div className="tag-row">
                  {(member.permissions || []).map((item) => <Badge key={item} tone="neutral">{item}</Badge>)}
                </div>
                {member.notes ? <p style={{ marginBottom: 0 }}>{member.notes}</p> : null}
                <div className="dashboard-actions mt-1">
                  <Button variant="ghost" onClick={() => setForm({
                    name: member.name || '',
                    email: member.email || '',
                    title: member.title || '',
                    notes: member.notes || '',
                    permissions: member.permissions || [],
                    status: member.status || 'active',
                    _id: member._id
                  })}>Edit</Button>
                  <Button variant="ghost" onClick={async () => {
                    await employerApi.removeTeamMember(member._id);
                    toast.success('Team member removed');
                    await loadTeam();
                  }}>Remove</Button>
                </div>
              </article>
            )) : <p className="m-0">No hiring team members yet.</p>}
          </div>
        </Card>

        <Card>
          <div className="panel-head">
            <div>
              <p className="section-eyebrow">Add member</p>
              <h3>Collaborative hiring setup</h3>
            </div>
          </div>
          <div className="form-grid">
            <Input label="Name" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
            <Input label="Email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} />
            <Input label="Title" value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} placeholder="Lead recruiter, interviewer, hiring manager" />
            <Textarea label="Notes" value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} placeholder="What does this person own?" />
            <div>
              <strong>Permissions</strong>
              <div className="tag-row mt-1">
                {permissions.map((item) => (
                  <label key={item} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(item)}
                      onChange={(e) => setForm((current) => ({
                        ...current,
                        permissions: e.target.checked
                          ? [...current.permissions, item]
                          : current.permissions.filter((permission) => permission !== item)
                      }))}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="dashboard-actions">
              <Button onClick={async () => {
                if (form._id) {
                  await employerApi.updateTeamMember(form._id, form);
                } else {
                  await employerApi.saveTeamMember(form);
                }
                toast.success('Team member saved');
                setForm(emptyForm);
                await loadTeam();
              }}>
                {form._id ? 'Update member' : 'Add member'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
