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

  const loadItems = async (type = selectedType) => {
    setLoading(true);
    const res = await masterDataApi.list(type);
    setItems(res.data || []);
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, [selectedType]);

  return (
    <>
      <Seo title="Master Data | Hirexo" description="Manage categories, industries, locations, and job types." />
      <DashboardHeader title="Master Data" description="Maintain platform-wide lists used across forms and filters." />
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
