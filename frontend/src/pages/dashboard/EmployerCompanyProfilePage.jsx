import { useEffect, useState } from 'react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import { employerApi } from '../../services/employer.api';
import { toast } from 'react-toastify';

export default function EmployerCompanyProfilePage() {
  const [form, setForm] = useState({ companyName: '', website: '', description: '', contactPerson: '', contactPhone: '', address: '', logoUrl: '' });

  useEffect(() => {
    employerApi.profile().then((res) => {
      const profile = res.data || {};
      setForm({
        companyName: profile.companyName || '',
        website: profile.website || '',
        description: profile.description || '',
        contactPerson: profile.contactPerson || '',
        contactPhone: profile.contactPhone || '',
        address: profile.address || '',
        logoUrl: profile.logoUrl || ''
      });
    }).catch(() => {});
  }, []);

  return (
    <>
      <Seo title="Company Profile | Hirexo" description="Manage company profile information." />
      <DashboardHeader title="Company Profile" description="Set up your company details and branding." />
      <Card>
        <form className="form-grid" onSubmit={async (e) => {
          e.preventDefault();
          try {
            await employerApi.saveProfile(form);
            toast.success('Company profile saved');
          } catch (error) {
            toast.error(error.message || 'Failed to save company profile');
          }
        }}>
          <Input label="Company name" value={form.companyName} onChange={(e) => setForm((current) => ({ ...current, companyName: e.target.value }))} />
          <div className="grid-2">
            <Input
              label="Logo URL"
              type="url"
              placeholder="https://..."
              value={form.logoUrl}
              onChange={(e) => setForm((current) => ({ ...current, logoUrl: e.target.value }))}
            />
            <Card className="logo-preview-card">
              <span className="field-label">Logo preview</span>
              {form.logoUrl ? (
                <div style={{ width: '100%', minHeight: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '0.5rem' }}>
                  <img
                    src={form.logoUrl}
                    alt={`${form.companyName || 'Company'} logo preview`}
                    style={{ width: '96px', height: '96px', objectFit: 'cover', borderRadius: '16px', border: '1px solid rgba(26, 138, 86, 0.15)' }}
                  />
                </div>
              ) : (
                <p className="m-0">Add a logo URL to preview your branding here.</p>
              )}
            </Card>
          </div>
          <div className="grid-2">
            <Input label="Website" value={form.website} onChange={(e) => setForm((current) => ({ ...current, website: e.target.value }))} />
            <Input label="Contact person" value={form.contactPerson} onChange={(e) => setForm((current) => ({ ...current, contactPerson: e.target.value }))} />
          </div>
          <div className="grid-2">
            <Input label="Contact phone" value={form.contactPhone} onChange={(e) => setForm((current) => ({ ...current, contactPhone: e.target.value }))} />
            <Input label="Address" value={form.address} onChange={(e) => setForm((current) => ({ ...current, address: e.target.value }))} />
          </div>
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} />
          <Button type="submit">Save profile</Button>
        </form>
      </Card>
    </>
  );
}
