import { useEffect, useState } from 'react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Loader from '../../components/ui/Loader';
import { masterDataApi } from '../../services/masterData.api';
import { adminApi } from '../../services/admin.api';
import { toast } from 'react-toastify';

const types = [
  { value: 'categories', label: 'Categories' },
  { value: 'industries', label: 'Industries' },
  { value: 'locations', label: 'Locations' },
  { value: 'job-types', label: 'Job Types' }
];

export default function AdminMasterDataPage() {
  const [selectedType, setSelectedType] = useState('categories');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    skillsWeight: 60,
    experienceWeight: 20,
    locationWeight: 10,
    profileWeight: 10,
    highFitThreshold: 80,
    moderateFitThreshold: 60
  });

  const loadItems = async (type = selectedType) => {
    setLoading(true);
    const res = await masterDataApi.list(type);
    setItems(res.data || []);
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, [selectedType]);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.settings();
        if (res?.data?.aiScoring) {
          setSettingsForm((prev) => ({ ...prev, ...res.data.aiScoring }));
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Unable to load AI settings');
      }
    })();
  }, []);

  const updateSettingField = (field, value) => {
    setSettingsForm((prev) => ({
      ...prev,
      [field]: value === '' ? '' : Number(value)
    }));
  };

  const saveAiSettings = async () => {
    setSavingSettings(true);
    try {
      const payload = {
        aiScoring: Object.fromEntries(
          Object.entries(settingsForm).map(([key, value]) => [key, Number(value || 0)])
        )
      };
      const res = await adminApi.updateSettings(payload);
      setSettingsForm((prev) => ({ ...prev, ...(res?.data?.aiScoring || {}) }));
      toast.success('AI scoring settings saved');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save AI settings');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <>
      <Seo title="Master Data | Hirexo" description="Manage categories, industries, locations, and job types." />
      <DashboardHeader title="Master Data" description="Maintain platform-wide lists used across forms and filters." />
      <Card className="mb-1">
        <h3 style={{ marginTop: 0 }}>AI Candidate Scoring</h3>
        <p style={{ marginTop: '0.35rem', color: 'var(--muted)' }}>
          Tune the candidate matching score shown in employer applicant lists.
        </p>
        <div className="grid-2">
          <Input type="number" label="Skills weight" min="0" max="100" value={settingsForm.skillsWeight} onChange={(e) => updateSettingField('skillsWeight', e.target.value)} />
          <Input type="number" label="Experience weight" min="0" max="100" value={settingsForm.experienceWeight} onChange={(e) => updateSettingField('experienceWeight', e.target.value)} />
          <Input type="number" label="Location weight" min="0" max="100" value={settingsForm.locationWeight} onChange={(e) => updateSettingField('locationWeight', e.target.value)} />
          <Input type="number" label="Profile completeness weight" min="0" max="100" value={settingsForm.profileWeight} onChange={(e) => updateSettingField('profileWeight', e.target.value)} />
          <Input type="number" label="High fit threshold" min="1" max="100" value={settingsForm.highFitThreshold} onChange={(e) => updateSettingField('highFitThreshold', e.target.value)} />
          <Input type="number" label="Moderate fit threshold" min="1" max="99" value={settingsForm.moderateFitThreshold} onChange={(e) => updateSettingField('moderateFitThreshold', e.target.value)} />
        </div>
        <div style={{ marginTop: '0.9rem' }}>
          <Button onClick={saveAiSettings} disabled={savingSettings}>{savingSettings ? 'Saving...' : 'Save AI Settings'}</Button>
        </div>
      </Card>
      <Card>
        <div className="grid-2">
          <Select label="Type" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            {types.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </Select>
          <div className="form-links align-end">
            <Input label="New item" value={name} onChange={(e) => setName(e.target.value)} />
            <Button onClick={async () => { await masterDataApi.create(selectedType, { name }); setName(''); toast.success('Item created'); loadItems(); }}>Add</Button>
          </div>
        </div>
      </Card>
      <Card className="mt-1">
        {loading ? <Loader label="Loading items..." /> : (
          <div className="tag-row">{items.length ? items.map((item) => <Badge key={item._id}>{item.name}</Badge>) : <span>No items yet.</span>}</div>
        )}
      </Card>
    </>
  );
}
