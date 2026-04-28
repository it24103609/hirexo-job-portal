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

const emptyPolicy = {
  name: '',
  category: 'workflow',
  description: '',
  status: 'active',
  responseSlaHours: 24,
  interviewReminderHours: 24,
  offerExpiryDays: 7,
  approvalRequired: false,
  autoArchiveDays: 30,
  tags: ''
};

export default function EmployerPoliciesConfigPage() {
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState([]);
  const [configuration, setConfiguration] = useState({
    interviewReminderHours: 24,
    rescheduleApprovalRequired: true,
    offerApprovalRequired: true,
    exportFormat: 'csv',
    activitySyncMode: 'daily',
    defaultInterviewDurationMinutes: 45,
    defaultCalendarView: 'agenda'
  });
  const [policyForm, setPolicyForm] = useState(emptyPolicy);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await employerApi.policies();
      setPolicies(res.data?.policies || []);
      setConfiguration(res.data?.configuration || configuration);
    } catch (error) {
      toast.error(error.message || 'Failed to load policies');
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loader label="Loading policies and configurations..." />;

  return (
    <>
      <Seo title="Hiring Policies & Configurations | Hirexo" description="Manage SLAs, offer expiry, reminder timings, approvals, and hiring workflow defaults." />
      <DashboardHeader title="Hiring Policies + Configurations" description="Define hiring rules, turnaround SLAs, approval requirements, reminder timings, and workflow defaults." />

      <div className="grid-2">
        <Card>
          <div className="panel-head">
            <div>
              <p className="section-eyebrow">Policy</p>
              <h3>Create hiring policy</h3>
            </div>
          </div>
          <div className="form-grid">
            <Input label="Policy name" value={policyForm.name} onChange={(event) => setPolicyForm((current) => ({ ...current, name: event.target.value }))} />
            <div className="grid-2">
              <Select label="Category" value={policyForm.category} onChange={(event) => setPolicyForm((current) => ({ ...current, category: event.target.value }))}>
                <option value="workflow">Workflow</option>
                <option value="sla">SLA</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="communication">Communication</option>
              </Select>
              <Select label="Status" value={policyForm.status} onChange={(event) => setPolicyForm((current) => ({ ...current, status: event.target.value }))}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </Select>
            </div>
            <Textarea label="Description" value={policyForm.description} onChange={(event) => setPolicyForm((current) => ({ ...current, description: event.target.value }))} />
            <div className="dashboard-surface-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <Input label="Response SLA (hrs)" type="number" value={policyForm.responseSlaHours} onChange={(event) => setPolicyForm((current) => ({ ...current, responseSlaHours: event.target.value }))} />
              <Input label="Reminder (hrs)" type="number" value={policyForm.interviewReminderHours} onChange={(event) => setPolicyForm((current) => ({ ...current, interviewReminderHours: event.target.value }))} />
              <Input label="Offer expiry (days)" type="number" value={policyForm.offerExpiryDays} onChange={(event) => setPolicyForm((current) => ({ ...current, offerExpiryDays: event.target.value }))} />
              <Input label="Auto archive (days)" type="number" value={policyForm.autoArchiveDays} onChange={(event) => setPolicyForm((current) => ({ ...current, autoArchiveDays: event.target.value }))} />
            </div>
            <Input label="Tags" value={policyForm.tags} onChange={(event) => setPolicyForm((current) => ({ ...current, tags: event.target.value }))} placeholder="sla, interview, standard" />
            <label className="field">
              <span className="field-label">Approval required</span>
              <input type="checkbox" checked={Boolean(policyForm.approvalRequired)} onChange={(event) => setPolicyForm((current) => ({ ...current, approvalRequired: event.target.checked }))} />
            </label>
            <div className="dashboard-actions">
              <Button onClick={async () => {
                await employerApi.savePolicy({
                  name: policyForm.name,
                  category: policyForm.category,
                  description: policyForm.description,
                  status: policyForm.status,
                  tags: policyForm.tags,
                  rules: {
                    responseSlaHours: Number(policyForm.responseSlaHours || 24),
                    interviewReminderHours: Number(policyForm.interviewReminderHours || 24),
                    offerExpiryDays: Number(policyForm.offerExpiryDays || 7),
                    approvalRequired: Boolean(policyForm.approvalRequired),
                    autoArchiveDays: Number(policyForm.autoArchiveDays || 30)
                  }
                });
                toast.success('Policy saved');
                setPolicyForm(emptyPolicy);
                await loadData();
              }}>
                Save policy
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="panel-head">
            <div>
              <p className="section-eyebrow">Configuration</p>
              <h3>Workflow defaults</h3>
            </div>
          </div>
          <div className="form-grid">
            <div className="grid-2">
              <Input label="Interview reminder hours" type="number" value={configuration.interviewReminderHours} onChange={(event) => setConfiguration((current) => ({ ...current, interviewReminderHours: event.target.value }))} />
              <Input label="Default duration (mins)" type="number" value={configuration.defaultInterviewDurationMinutes} onChange={(event) => setConfiguration((current) => ({ ...current, defaultInterviewDurationMinutes: event.target.value }))} />
            </div>
            <div className="grid-2">
              <Select label="Export format" value={configuration.exportFormat} onChange={(event) => setConfiguration((current) => ({ ...current, exportFormat: event.target.value }))}>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </Select>
              <Select label="Activity sync" value={configuration.activitySyncMode} onChange={(event) => setConfiguration((current) => ({ ...current, activitySyncMode: event.target.value }))}>
                <option value="manual">Manual</option>
                <option value="daily">Daily</option>
                <option value="realtime">Realtime</option>
              </Select>
            </div>
            <Select label="Calendar view" value={configuration.defaultCalendarView} onChange={(event) => setConfiguration((current) => ({ ...current, defaultCalendarView: event.target.value }))}>
              <option value="agenda">Agenda</option>
              <option value="month">Month</option>
            </Select>
            <label className="field">
              <span className="field-label">Reschedule approval required</span>
              <input type="checkbox" checked={Boolean(configuration.rescheduleApprovalRequired)} onChange={(event) => setConfiguration((current) => ({ ...current, rescheduleApprovalRequired: event.target.checked }))} />
            </label>
            <label className="field">
              <span className="field-label">Offer approval required</span>
              <input type="checkbox" checked={Boolean(configuration.offerApprovalRequired)} onChange={(event) => setConfiguration((current) => ({ ...current, offerApprovalRequired: event.target.checked }))} />
            </label>
            <div className="dashboard-actions">
              <Button onClick={async () => {
                await employerApi.updateConfigurations({
                  ...configuration,
                  interviewReminderHours: Number(configuration.interviewReminderHours || 24),
                  defaultInterviewDurationMinutes: Number(configuration.defaultInterviewDurationMinutes || 45)
                });
                toast.success('Configuration updated');
                await loadData();
              }}>
                Save configuration
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-1">
        <div className="panel-head">
          <div>
            <p className="section-eyebrow">Library</p>
            <h3>Existing policies</h3>
          </div>
          <Badge>{policies.length} policies</Badge>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {policies.length ? policies.map((policy) => (
            <article key={policy._id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
              <div className="panel-head" style={{ marginBottom: 0 }}>
                <div>
                  <strong>{policy.name}</strong>
                  <p className="m-0">{policy.category} · SLA {policy.rules?.responseSlaHours || 24} hrs</p>
                </div>
                <Badge tone={policy.status === 'active' ? 'success' : 'neutral'}>{policy.status}</Badge>
              </div>
              {policy.description ? <p>{policy.description}</p> : null}
            </article>
          )) : <p className="m-0">No hiring policies created yet.</p>}
        </div>
      </Card>
    </>
  );
}
