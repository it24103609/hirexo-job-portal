import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Loader from '../../components/ui/Loader';
import { employerApi } from '../../services/employer.api';

const emptyForm = {
  job: '',
  teamMember: '',
  allocationType: 'recruiter',
  roundName: '',
  workloadPercent: 50,
  status: 'active',
  notes: ''
};

export default function EmployerAllocationsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ allocations: [], jobs: [], team: [] });
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await employerApi.allocations();
      setData(res.data || { allocations: [], jobs: [], team: [] });
    } catch (error) {
      toast.error(error.message || 'Failed to load allocations');
      setData({ allocations: [], jobs: [], team: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loader label="Loading allocations..." />;

  return (
    <>
      <Seo title="Recruiter Allocation | Hirexo" description="Assign recruiters and interviewers to jobs and interview rounds." />
      <DashboardHeader title="Recruiter / Interviewer Allocation" description="Distribute hiring workload across recruiters, interviewers, coordinators, and approvers." />

      <div className="grid-2">
        <Card>
          <div className="panel-head">
            <div>
              <p className="section-eyebrow">Assignment</p>
              <h3>Create allocation</h3>
            </div>
          </div>
          <div className="form-grid">
            <Select label="Job" value={form.job} onChange={(event) => setForm((current) => ({ ...current, job: event.target.value }))}>
              <option value="">Select job</option>
              {(data.jobs || []).map((job) => <option key={job._id} value={job._id}>{job.title}</option>)}
            </Select>
            <Select label="Team member" value={form.teamMember} onChange={(event) => setForm((current) => ({ ...current, teamMember: event.target.value }))}>
              <option value="">Select member</option>
              {(data.team || []).map((member) => <option key={member._id} value={member._id}>{member.name} · {member.title || 'Team'}</option>)}
            </Select>
            <div className="grid-2">
              <Select label="Allocation type" value={form.allocationType} onChange={(event) => setForm((current) => ({ ...current, allocationType: event.target.value }))}>
                <option value="recruiter">Recruiter</option>
                <option value="interviewer">Interviewer</option>
                <option value="coordinator">Coordinator</option>
                <option value="approver">Approver</option>
              </Select>
              <Input label="Round name" value={form.roundName} onChange={(event) => setForm((current) => ({ ...current, roundName: event.target.value }))} placeholder="Technical round" />
            </div>
            <div className="grid-2">
              <Input label="Workload %" type="number" min="0" max="100" value={form.workloadPercent} onChange={(event) => setForm((current) => ({ ...current, workloadPercent: event.target.value }))} />
              <Select label="Status" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </Select>
            </div>
            <Textarea label="Notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
            <div className="dashboard-actions">
              <Button onClick={async () => {
                await employerApi.saveAllocation(form);
                toast.success('Allocation saved');
                setForm(emptyForm);
                await loadData();
              }}>
                Save allocation
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="panel-head">
            <div>
              <p className="section-eyebrow">Coverage</p>
              <h3>Current allocations</h3>
            </div>
            <Badge>{(data.allocations || []).length} active records</Badge>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {(data.allocations || []).length ? data.allocations.map((allocation) => (
              <article key={allocation._id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, display: 'grid', gap: 6 }}>
                <strong>{allocation.job?.title || 'Job'}</strong>
                <div>{allocation.teamMember?.name || 'Member'} · {allocation.allocationType}</div>
                <small>{allocation.roundName || 'General assignment'} · {allocation.workloadPercent}% workload</small>
                <div className="dashboard-actions">
                  <Badge tone={allocation.status === 'active' ? 'success' : 'neutral'}>{allocation.status}</Badge>
                  <Button size="sm" variant="ghost" onClick={async () => { await employerApi.removeAllocation(allocation._id); toast.info('Allocation removed'); await loadData(); }}>
                    Remove
                  </Button>
                </div>
              </article>
            )) : <p className="m-0">No allocations yet. Assign recruiters and interviewers to active jobs.</p>}
          </div>
        </Card>
      </div>
    </>
  );
}
