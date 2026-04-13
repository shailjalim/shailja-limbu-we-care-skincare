import React, { useEffect, useState } from 'react';
import { deleteAdminUser, getAdminUsers, updateAdminUserRole } from '../services/api';

const getSubscriptionStatus = (user) => {
  if (user?.subscription?.isActive) {
    return { label: 'Premium User', className: 'bg-green-100 text-green-700' };
  }

  if (user?.subscriptionStatus === 'premium') {
    return { label: 'Premium User', className: 'bg-green-100 text-green-700' };
  }

  return { label: 'Free User', className: 'bg-gray-100 text-gray-700' };
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminUsers();
      setUsers(response.users || []);
    } catch (err) {
      setError(err.message || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleRole = async (user) => {
    try {
      const nextRole = user.role === 'admin' ? 'user' : 'admin';
      await updateAdminUserRole(user._id, nextRole);
      setMessage(`Updated ${user.name} to ${nextRole}.`);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Unable to update role');
    }
  };

  const removeUser = async (user) => {
    if (!window.confirm(`Delete user ${user.name}?`)) return;
    try {
      await deleteAdminUser(user._id);
      setMessage('User deleted successfully.');
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Unable to delete user');
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-500">Loading users...</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Admin Users</h1>
      {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
      {message && <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-green-700">{message}</div>}

      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Subscription</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t border-gray-200">
                <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                <td className="px-4 py-3 text-gray-700">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getSubscriptionStatus(user).className}`}>
                    {getSubscriptionStatus(user).label}
                  </span>
                </td>
                <td className="px-4 py-3 capitalize text-gray-700">{user.role}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => toggleRole(user)} className="rounded-full border border-pink-300 bg-pink-50 px-3 py-1 text-xs text-pink-700 hover:bg-pink-100">
                      {user.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>
                    <button onClick={() => removeUser(user)} className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;