import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Badge from '../../components/ui/Badge';
import { employerApi } from '../../services/employer.api';
import { OFFER_STATUS_OPTIONS } from '../../utils/applicationMeta';

const emptyOffer = {
  applicationId: '',
  title: '',
  salary: '',
  currency: 'LKR',
  joiningDate: '',
  preparedByName: '',
  notes: '',
  status: 'draft'
};

export default function EmployerOffersPage() {
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [form, setForm] = useState(emptyOffer);

  const loadData = async () => {
    setLoading(true);
    try {
      const [offersRes, jobsRes] = await Promise.all([employerApi.offers(), employerApi.jobs()]);
      const jobsData = jobsRes.data || [];
      const applicantResults = await Promise.allSettled(jobsData.map((job) => employerApi.applicants(job._id, { sortBy: 'recent' })));
      const nextApplications = applicantResults.flatMap((result) => (result.status === 'fulfilled' ? result.value.data?.applications || [] : []));
      setOffers(offersRes.data || []);
      setJobs(jobsData);
      setApplications(nextApplications.filter((item) => ['shortlisted', 'interview_scheduled', 'hired'].includes(item.status)));
    } catch (error) {
      toast.error(error.message || 'Failed to load offers workspace');
      setOffers([]);
      setJobs([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <Loader label="Loading offers..." />;

  return (
    <>
      <Seo title="Offers | Hirexo" description="Create and track offers for shortlisted candidates." />
      <DashboardHeader title="Offer Management" description="Move from final interview to offer decision with a simple offer workspace." />
      <div className="grid-2">
        <Card>
          <div className="panel-head">
            <div>
              <p className="section-eyebrow">Create offer</p>
              <h3>Offer workspace</h3>
            </div>
          </div>
          <div className="form-grid">
            <Select label="Application" value={form.applicationId} onChange={(e) => setForm((current) => ({ ...current, applicationId: e.target.value }))}>
              <option value="">Select candidate</option>
              {applications.map((application) => (
                <option key={application._id} value={application._id}>
                  {application.candidateUser?.name || 'Candidate'} · {application.jobTitle || application.job?.title || 'Role'}
                </option>
              ))}
            </Select>
            <Input label="Offer title" value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} placeholder="Senior Frontend Engineer Offer" />
            <div className="grid-2">
              <Input label="Salary" type="number" value={form.salary} onChange={(e) => setForm((current) => ({ ...current, salary: e.target.value }))} />
              <Input label="Currency" value={form.currency} onChange={(e) => setForm((current) => ({ ...current, currency: e.target.value }))} />
            </div>
            <div className="grid-2">
              <Input label="Joining date" type="date" value={form.joiningDate} onChange={(e) => setForm((current) => ({ ...current, joiningDate: e.target.value }))} />
              <Input label="Prepared by" value={form.preparedByName} onChange={(e) => setForm((current) => ({ ...current, preparedByName: e.target.value }))} />
            </div>
            <Select label="Status" value={form.status} onChange={(e) => setForm((current) => ({ ...current, status: e.target.value }))}>
              {OFFER_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </Select>
            <Textarea label="Notes" value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} placeholder="Compensation notes, approval context, joining expectations" />
            <div className="dashboard-actions">
              <Button onClick={async () => {
                await employerApi.createOffer(form);
                toast.success('Offer saved');
                setForm(emptyOffer);
                await loadData();
              }}>
                Save offer
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="panel-head">
            <div>
              <p className="section-eyebrow">Tracker</p>
              <h3>Offer pipeline</h3>
            </div>
            <Badge tone="success">{offers.length} offers</Badge>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {offers.length ? offers.map((offer) => (
              <article key={offer._id} className="card">
                <div className="panel-head" style={{ marginBottom: 8 }}>
                  <div>
                    <strong>{offer.candidateUser?.name || 'Candidate'}</strong>
                    <p className="m-0">{offer.job?.title || offer.title}</p>
                  </div>
                  <Badge>{offer.status}</Badge>
                </div>
                <p className="m-0">{offer.currency} {offer.salary || 0}</p>
                <p className="m-0">Joining date: {offer.joiningDate ? new Date(offer.joiningDate).toLocaleDateString('en-IN') : 'Not set'}</p>
                {offer.notes ? <p>{offer.notes}</p> : null}
                <div className="dashboard-actions">
                  <Select value={offer.status} onChange={async (e) => {
                    await employerApi.updateOfferStatus(offer._id, { status: e.target.value });
                    toast.success('Offer status updated');
                    await loadData();
                  }}>
                    {OFFER_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </Select>
                </div>
              </article>
            )) : <p className="m-0">No offers created yet. Pick a shortlisted or interview-stage candidate to start.</p>}
          </div>
        </Card>
      </div>
    </>
  );
}
