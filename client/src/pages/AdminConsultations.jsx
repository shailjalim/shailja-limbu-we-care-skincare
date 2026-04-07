import React, { useEffect, useState } from 'react';
import AdminModal from '../components/admin/AdminModal';
import {
  deleteAdminConsultation,
  getAdminConsultations,
  updateAdminConsultation,
} from '../services/api';

const AdminConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [status, setStatus] = useState('pending');
  const [adminReply, setAdminReply] = useState('');

  const loadConsultations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminConsultations();
      setConsultations(response.consultations || []);
    } catch (err) {
      setError(err.message || 'Unable to load consultations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsultations();
  }, []);

  const openReplyModal = (item) => {
    setActiveConsultation(item);
    setStatus(item.status || 'pending');
    setAdminReply(item.adminReply || '');
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!activeConsultation) return;
    try {
      await updateAdminConsultation(activeConsultation._id, { status, adminReply });
      setMessage('Consultation updated successfully.');
      setIsModalOpen(false);
      await loadConsultations();
    } catch (err) {
      setError(err.message || 'Unable to update consultation');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this consultation request?')) return;
    try {
      await deleteAdminConsultation(id);
      setMessage('Consultation deleted successfully.');
      await loadConsultations();
    } catch (err) {
      setError(err.message || 'Unable to delete consultation');
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-500">Loading consultations...</div>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Admin Consultations</h1>
      {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
      {message && <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-green-700">{message}</div>}

      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Reply</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {consultations.map((item) => (
              <tr key={item._id} className="border-t border-gray-200">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{item.user?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{item.user?.email || ''}</p>
                </td>
                <td className="px-4 py-3 text-gray-700 max-w-[340px]">
                  <p className="line-clamp-3 whitespace-pre-line">{item.message}</p>
                </td>
                <td className="px-4 py-3 capitalize text-gray-700">{item.status}</td>
                <td className="px-4 py-3 text-gray-700 max-w-[260px]">
                  <p className="line-clamp-2 whitespace-pre-line">{item.adminReply || 'No reply yet'}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => openReplyModal(item)} className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs text-blue-700 hover:bg-blue-100">Reply / Update</button>
                    <button onClick={() => handleDelete(item._id)} className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal isOpen={isModalOpen} title="Update Consultation" onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
            <select className="w-full rounded-xl border border-gray-300 px-4 py-3" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Admin Reply</label>
            <textarea
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
              rows={6}
              value={adminReply}
              onChange={(e) => setAdminReply(e.target.value)}
              placeholder="Write your reply..."
            />
          </div>
          <button type="submit" className="w-full rounded-xl bg-pink-600 px-4 py-3 font-medium text-white hover:bg-pink-700 transition">Save Changes</button>
        </form>
      </AdminModal>
    </div>
  );
};

export default AdminConsultations;