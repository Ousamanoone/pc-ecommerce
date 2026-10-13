import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  CheckCircle2,
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
} from 'lucide-react';

interface AccountUser {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'staff' | 'admin';
  createdAt: string;
}

export const AdminUserManager: React.FC = () => {
  const [users, setUsers] = useState<AccountUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.users || res.data || []);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      await api.post('/users/provision-staff', formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', phone: '' });
      fetchUsers();
      alert('Staff account successfully created!');
    } catch (err: any) {
      setFeedback(err.response?.data?.message || 'Provisioning failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-content/10 pb-5">
        <div>
          <span className="badge badge-primary badge-xs font-bold uppercase text-[9px] mb-1">
            Access Control
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-base-content flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Identity & Role Management
          </h1>
          <p className="text-xs text-base-content/60 mt-0.5">
            Audit registered customer base and provision authorized staff personnel.
          </p>
        </div>

        <button
          onClick={() => {
            setFeedback(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary btn-sm rounded-xl font-bold text-xs gap-1.5 shadow-md shadow-primary/20"
        >
          <UserPlus className="w-4 h-4" /> Provision Staff Account
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
        <input
          type="text"
          placeholder="Filter by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input input-bordered input-sm rounded-xl w-full pl-9 text-xs bg-base-200"
        />
      </div>

      {/* User Table */}
      {loading ? (
        <div className="py-20 text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="bg-base-200 border border-base-content/10 rounded-3xl overflow-hidden shadow-xs">
          <table className="table table-sm text-xs">
            <thead className="bg-base-300/50 text-[11px] uppercase tracking-wider text-base-content/60">
              <tr>
                <th>User Account</th>
                <th>Role Assignment</th>
                <th>Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-content/5">
              {filteredUsers.map((item) => (
                <tr key={item._id} className="hover:bg-base-100/50">
                  <td className="py-3">
                    <p className="font-bold text-base-content">{item.name}</p>
                    <span className="text-[11px] text-base-content/50 font-mono">
                      {item.email}
                    </span>
                  </td>
                  <td>
                    {item.role === 'admin' && (
                      <span className="badge badge-error badge-xs font-bold uppercase text-[9px] text-white">
                        Super Admin
                      </span>
                    )}
                    {item.role === 'staff' && (
                      <span className="badge badge-warning badge-xs font-bold uppercase text-[9px] text-black">
                        Staff Operator
                      </span>
                    )}
                    {item.role === 'customer' && (
                      <span className="badge badge-ghost badge-xs font-bold uppercase text-[9px]">
                        Customer
                      </span>
                    )}
                  </td>
                  <td className="text-base-content/50 font-mono text-[11px]">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL PROVISION STAFF */}
      {isModalOpen && (
        <div className="modal modal-open z-50">
          <div className="modal-box max-w-md rounded-3xl bg-base-100 border border-base-content/10 p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-base-content/10 pb-3">
              <h3 className="font-black text-base text-base-content flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Provision Staff Account
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-ghost btn-xs btn-circle text-base-content/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedback && (
              <div className="alert alert-error text-xs font-bold text-white rounded-xl py-2">
                {feedback}
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-base-content/70 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input
                    type="text"
                    required
                    placeholder="Nguyen Van A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input input-bordered input-sm rounded-xl w-full pl-9 text-xs bg-base-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-base-content/70 mb-1">
                  Work Email *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input
                    type="email"
                    required
                    placeholder="staff.support@gearstore.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input input-bordered input-sm rounded-xl w-full pl-9 text-xs bg-base-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-base-content/70 mb-1">
                  Initial Password (min 8 characters) *
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="input input-bordered input-sm rounded-xl w-full pl-9 text-xs bg-base-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-base-content/70 mb-1">
                  Direct Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input
                    type="tel"
                    placeholder="0901234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input input-bordered input-sm rounded-xl w-full pl-9 text-xs bg-base-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-base-content/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost btn-sm rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm rounded-xl text-xs font-bold px-5"
                >
                  {submitting ? 'Creating...' : 'Issue Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManager;