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
import { formatDate } from '../../utils/formatters';

const emptyForm = {
  type: 'general',
  title: '',
  description: '',
  priority: 'medium',
  requestedByName: '',
  dueAt: ''
};

export default function EmployerApprovalsPage() {
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await employerApi.approvals();
      setApprovals(res.data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load approvals');
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loader label="Loading approvals..." />;

  return (
    <>
      <Seo title="Requests & Approvals | Hirexo" description="Manage hiring requests, sign-offs, and approval decisions." />
      <DashboardHeader title="Requests & Approvals" description="Track budget sign-offs, offer approvals, reschedule decisions, and internal hiring requests." />

      <div className="grid-2">
        <Card>
          <div className="panel-head">
            <div>
              <p className="section-eyebrow">New request</p>
              <h3>Create approval</h3>
            </div>
          </div>
          <div className="form-grid">
            <Select label="Type" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
              <option value="general">General</option>
              <option value="job_publish">Job publish</option>
              <option value="offer_approval">Offer approval</option>
              <option value="interview_reschedule">Interview reschedule</option>
              <option value="policy_change">Policy change</option>
              <option value="budget_signoff">Budget signoff</option>
            </Select>
            <Input label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            <div className="grid-2">
              <Select label="Priority" value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
              <Input label="Due date" type="date" value={form.dueAt} onChange={(event) => setForm((current) => ({ ...current, dueAt: event.target.value }))} />
            </div>
            <Input label="Requested by" value={form.requestedByName} onChange={(event) => setForm((current) => ({ ...current, requestedByName: event.target.value }))} />
            <Textarea label="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            <div className="dashboard-actions">
              <Button onClick={async () => {
                await employerApi.createApproval(form);
                toast.success('Approval request created');
                setForm(emptyForm);
                await loadData();
              }}>
                Save request
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="panel-head">
            <div>
              <p className="section-eyebrow">Queue</p>
              <h3>Approval tracker</h3>
            </div>
            <Badge>{approvals.length} requests</Badge>
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {approvals.length ? approvals.map((approval) => (
              <article key={approval._id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, display: 'grid', gap: 8 }}>
                <div className="panel-head" style={{ marginBottom: 0 }}>
                  <div>
                    <strong>{approval.title}</strong>
                    <p className="m-0">{approval.type.replace(/_/g, ' ')} · Due {formatDate(approval.dueAt)}</p>
                  </div>
                  <Badge tone={approval.status === 'approved' ? 'success' : approval.status === 'rejected' ? 'danger' : 'warning'}>{approval.status}</Badge>
                </div>
                {approval.description ? <p className="m-0">{approval.description}</p> : null}
                <small>Requested by {approval.requestedByName || 'Team'} · Priority {approval.priority}</small>
                <div className="dashboard-actions">
                  <Button size="sm" variant="secondary" onClick={async () => { await employerApi.updateApproval(approval._id, { status: 'approved' }); toast.success('Approval marked approved'); await loadData(); }}>Approve</Button>
                  <Button size="sm" variant="ghost" onClick={async () => { await employerApi.updateApproval(approval._id, { status: 'rejected' }); toast.info('Approval marked rejected'); await loadData(); }}>Reject</Button>
                </div>
              </article>
            )) : <p className="m-0">No approval requests yet.</p>}
          </div>
        </Card>
      </div>
    </>
  );
}
