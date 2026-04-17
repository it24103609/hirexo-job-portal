import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  Eye,
  FileText,
  Globe,
  Image,
  MapPin,
  Phone,
  RotateCcw,
  Save,
  UserRound
} from 'lucide-react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { employerApi } from '../../services/employer.api';
import { toast } from 'react-toastify';

const emptyForm = {
  companyName: '',
  website: '',
  description: '',
  contactPerson: '',
  contactPhone: '',
  address: '',
  logoUrl: ''
};

function normalizeWebsite(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export default function EmployerCompanyProfilePage() {
  const [form, setForm] = useState(emptyForm);
  const [savedForm, setSavedForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const previewRef = useRef(null);

  useEffect(() => {
    employerApi.profile().then((res) => {
      const profile = res.data || {};
      const nextForm = {
        companyName: profile.companyName || '',
        website: profile.website || '',
        description: profile.description || '',
        contactPerson: profile.contactPerson || '',
        contactPhone: profile.contactPhone || '',
        address: profile.address || '',
        logoUrl: profile.logoUrl || ''
      };

      setForm(nextForm);
      setSavedForm(nextForm);
      setLastUpdated(profile.updatedAt || profile.createdAt || '');
    }).catch(() => {});
  }, []);

  const completionItems = useMemo(() => {
    const contactComplete = Boolean(form.contactPerson.trim() && form.contactPhone.trim() && form.address.trim());

    return [
      { label: 'Logo added', completed: Boolean(form.logoUrl.trim()) },
      { label: 'Website added', completed: Boolean(form.website.trim()) },
      { label: 'Contact info completed', completed: contactComplete },
      { label: 'Description added', completed: Boolean(form.description.trim()) }
    ];
  }, [form]);

  const completionPercent = useMemo(() => {
    const completed = completionItems.filter((item) => item.completed).length;
    return Math.round((completed / completionItems.length) * 100);
  }, [completionItems]);

  const previewWebsite = normalizeWebsite(form.website.trim());
  const descriptionPreview = form.description.trim()
    ? `${form.description.trim().slice(0, 190)}${form.description.trim().length > 190 ? '...' : ''}`
    : 'Add a short and compelling company story to show candidates your mission and culture.';

  const resetFormChanges = () => {
    setForm(savedForm);
    toast.info('Unsaved changes discarded');
  };

  const scrollToPreview = () => {
    previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const response = await employerApi.saveProfile(form);
      const profile = response.data || {};
      const nextForm = {
        companyName: profile.companyName ?? form.companyName,
        website: profile.website ?? form.website,
        description: profile.description ?? form.description,
        contactPerson: profile.contactPerson ?? form.contactPerson,
        contactPhone: profile.contactPhone ?? form.contactPhone,
        address: profile.address ?? form.address,
        logoUrl: profile.logoUrl ?? form.logoUrl
      };

      setForm(nextForm);
      setSavedForm(nextForm);
      setLastUpdated(profile.updatedAt || new Date().toISOString());
      toast.success('Company profile saved');
    } catch (error) {
      toast.error(error.message || 'Failed to save company profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Seo title="Company Profile | Hirexo" description="Manage company profile information." />
      <DashboardHeader
        className="employer-company-header"
        title="Company Profile"
        description="Set up your company details and branding with a polished employer profile experience."
        actions={(
          <>
            <Button type="button" size="sm" variant="ghost" onClick={scrollToPreview}>
              <Eye size={16} />
              Preview Profile
            </Button>
            <Button type="submit" size="sm" form="employer-company-profile-form" disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        )}
      />

      <section className="employer-company-layout">
        <div className="employer-company-main">
          <Card className="employer-company-form-card">
            <form id="employer-company-profile-form" className="form-grid employer-company-form" onSubmit={handleSubmit}>
              <section className="employer-company-section">
                <div className="employer-section-head">
                  <h3><Building2 size={16} /> Company Identity</h3>
                  <p>Share your company branding basics so jobs and profile pages look complete and trustworthy.</p>
                </div>

                <div className="grid-2">
                  <Input
                    label="Company name"
                    placeholder="Hirexo Technologies Pvt Ltd"
                    value={form.companyName}
                    onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))}
                  />
                  <Input
                    label="Website"
                    type="url"
                    placeholder="https://hirexo.com"
                    value={form.website}
                    onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
                  />
                </div>

                <div className="grid-2 employer-company-identity-grid">
                  <Input
                    label="Logo URL"
                    type="url"
                    placeholder="https://cdn.../logo.png"
                    value={form.logoUrl}
                    onChange={(event) => setForm((current) => ({ ...current, logoUrl: event.target.value }))}
                  />

                  <div className="employer-logo-preview-card">
                    <div className="employer-logo-preview-head">
                      <strong><Image size={15} /> Logo preview</strong>
                      <small>Used across jobs and company profile views</small>
                    </div>
                    <div className="employer-logo-preview-stage">
                      {form.logoUrl ? (
                        <img src={form.logoUrl} alt={`${form.companyName || 'Company'} logo`} />
                      ) : (
                        <div className="employer-logo-preview-placeholder">
                          <Image size={20} />
                          <span>{(form.companyName || 'Company').slice(0, 1).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <p className="employer-field-help">Add a square logo for the cleanest appearance in listings.</p>
                  </div>
                </div>
              </section>

              <section className="employer-company-section">
                <div className="employer-section-head">
                  <h3><UserRound size={16} /> Contact Details</h3>
                  <p>Provide a clear contact identity so candidates and admins know who represents this company.</p>
                </div>

                <div className="grid-2">
                  <Input
                    label="Contact person"
                    placeholder="Aditi Sharma"
                    value={form.contactPerson}
                    onChange={(event) => setForm((current) => ({ ...current, contactPerson: event.target.value }))}
                  />
                  <Input
                    label="Contact phone"
                    placeholder="+91 98xxxxxx"
                    value={form.contactPhone}
                    onChange={(event) => setForm((current) => ({ ...current, contactPhone: event.target.value }))}
                  />
                </div>

                <Input
                  label="Address"
                  placeholder="Building, city, state"
                  value={form.address}
                  onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                />
              </section>

              <section className="employer-company-section">
                <div className="employer-section-head">
                  <h3><FileText size={16} /> Company Overview</h3>
                  <p className="employer-description-note">Share your mission, culture, and what makes your workplace stand out for top candidates.</p>
                </div>

                <Textarea
                  label="Description"
                  placeholder="Tell candidates about your team, values, and growth opportunities..."
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                />
              </section>

              <div className="employer-company-actions-bar">
                <p className="employer-last-updated">{lastUpdated ? `Last updated ${new Date(lastUpdated).toLocaleString('en-IN')}` : 'Profile has not been updated yet.'}</p>
                <div className="dashboard-actions">
                  <Button type="button" variant="ghost" onClick={resetFormChanges}>
                    <RotateCcw size={16} />
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>

        <aside className="employer-company-side" ref={previewRef}>
          <Card className="employer-profile-completion-card">
            <div className="panel-head employer-panel-head">
              <div>
                <p className="section-eyebrow">Profile quality</p>
                <h3>Completion indicators</h3>
              </div>
              <Badge tone={completionPercent >= 75 ? 'success' : 'neutral'}>{completionPercent}% complete</Badge>
            </div>

            <div className="employer-completion-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completionPercent}>
              <span style={{ width: `${completionPercent}%` }} />
            </div>

            <div className="employer-completion-list">
              {completionItems.map((item) => (
                <div key={item.label} className="employer-completion-item">
                  <p>{item.label}</p>
                  <Badge tone={item.completed ? 'success' : 'neutral'}>{item.completed ? 'Added' : 'Missing'}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="employer-public-preview-card">
            <div className="panel-head employer-panel-head">
              <div>
                <p className="section-eyebrow">Public appearance</p>
                <h3>Company preview</h3>
              </div>
              <Badge tone="neutral">Candidate view</Badge>
            </div>

            <div className="employer-public-preview-logo">
              {form.logoUrl ? <img src={form.logoUrl} alt={`${form.companyName || 'Company'} logo`} /> : <span>{(form.companyName || 'C').slice(0, 1).toUpperCase()}</span>}
            </div>
            <h4>{form.companyName || 'Your Company Name'}</h4>

            <div className="employer-public-preview-meta">
              <p><Globe size={14} /> {form.website ? (
                <a href={previewWebsite} target="_blank" rel="noreferrer">{form.website}</a>
              ) : 'Website not added yet'}</p>
              <p><Phone size={14} /> {form.contactPhone || 'Contact phone missing'}</p>
              <p><MapPin size={14} /> {form.address || 'Company address missing'}</p>
            </div>

            <p className="employer-public-preview-description">{descriptionPreview}</p>
          </Card>
        </aside>
      </section>
    </>
  );
}
