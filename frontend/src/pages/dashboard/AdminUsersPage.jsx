import { useEffect, useState } from 'react';
import Seo from '../../components/ui/Seo';
import DashboardHeader from '../../components/layout/DashboardHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { adminApi } from '../../services/admin.api';
import { toast } from 'react-toastify';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    const res = await adminApi.users();
    setUsers(res.data || []);
    setLoading(false);
  };

  useEffect(() => { loadUsers().catch(() => setLoading(false)); }, []);

  if (loading) return <Loader label="Loading users..." />;

  return (
    <>
      <Seo title="Manage Users | Hirexo" description="Block and unblock platform users." />
      <DashboardHeader title="User Management" description="Manage candidates, employers, and admins." />
      <Card>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {users.length ? users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td><Badge>{user.role}</Badge></td>
                  <td><Badge tone={user.status === 'blocked' ? 'danger' : 'success'}>{user.status}</Badge></td>
                  <td>
                    <Button size="sm" variant={user.status === 'blocked' ? 'secondary' : 'ghost'} onClick={async () => {
                      if (user.status === 'blocked') await adminApi.unblockUser(user._id); else await adminApi.blockUser(user._id);
                      toast.success('User status updated');
                      loadUsers();
                    }}>{user.status === 'blocked' ? 'Unblock' : 'Block'}</Button>
                  </td>
                </tr>
              )) : <tr><td colSpan="5">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
