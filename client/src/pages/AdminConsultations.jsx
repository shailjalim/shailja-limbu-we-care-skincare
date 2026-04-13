import React, { useEffect, useState } from 'react';
import AdminModal from '../components/admin/AdminModal';
import {
  deleteAdminConsultation,
  getAdminConsultations,
  updateAdminConsultation,
} from '../services/api';

const resolveImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;

  const configuredApiUrl = process.env.REACT_APP_API_URL;
  if (configuredApiUrl && configuredApiUrl.startsWith('http')) {
    return `${configuredApiUrl.replace(/\/?api\/?$/, '')}${imagePath}`;
  }

  return `http://localhost:5000${imagePath}`;
};

const AdminConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [status, setStatus] = useState('pending');
  const [adminReply, setAdminReply] = useState('');
  const [replyImages, setReplyImages] = useState([]);
  const [replyPreviewUrls, setReplyPreviewUrls] = useState([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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
    setReplyImages([]);
    replyPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    setReplyPreviewUrls([]);
    setIsModalOpen(true);
  };

  const handleReplyImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setError('');

    if (files.length > 3) {
      setError('You can upload up to 3 reply images.');
      e.target.value = '';
      return;
    }

    const invalid = files.find((file) => !['image/jpeg', 'image/jpg', 'image/png'].includes(file.type) || file.size > 2 * 1024 * 1024);
    if (invalid) {
      setError('Only JPG, JPEG, or PNG files up to 2MB are allowed.');
      e.target.value = '';
      return;
    }

    replyPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    const previews = files.map((file) => URL.createObjectURL(file));
    setReplyImages(files);
    setReplyPreviewUrls(previews);
  };

  const openDetailsModal = (item) => {
    setActiveConsultation(item);
    setIsDetailsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!activeConsultation) return;
    try {
      await updateAdminConsultation(activeConsultation._id, { status, adminReply, replyImages });
      setMessage('Consultation updated successfully.');
      setIsModalOpen(false);
      replyPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
      setReplyPreviewUrls([]);
      setReplyImages([]);
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
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Reply</th>
              <th className="px-4 py-3">Created</th>
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
                  <p className="line-clamp-2 font-medium">{item.title}</p>
                  <p className="line-clamp-2 whitespace-pre-line text-xs text-gray-500 mt-1">{item.description}</p>
                </td>
                <td className="px-4 py-3 capitalize text-gray-700">{item.status}</td>
                <td className="px-4 py-3 text-gray-700 max-w-[260px]">
                  <p className="line-clamp-2 whitespace-pre-line">{item.adminReply || 'No reply yet'}</p>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => openDetailsModal(item)} className="rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-xs text-gray-700 hover:bg-gray-100">View Details</button>
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
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
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
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Reply Images (optional, up to 3)</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              multiple
              onChange={handleReplyImagesChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3"
            />
            {Array.isArray(activeConsultation?.adminReplyImages) && activeConsultation.adminReplyImages.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-2">Current reply images</p>
                <div className="grid grid-cols-3 gap-2">
                  {activeConsultation.adminReplyImages.map((imagePath) => (
                    <img key={imagePath} src={resolveImageUrl(imagePath)} alt="Current reply" className="h-16 w-full rounded-lg border border-gray-200 object-cover" />
                  ))}
                </div>
              </div>
            )}
            {replyPreviewUrls.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">New images to upload</p>
                <div className="grid grid-cols-3 gap-2">
                  {replyPreviewUrls.map((url, index) => (
                    <img key={`${url}-${index}`} src={url} alt={`Reply preview ${index + 1}`} className="h-16 w-full rounded-lg border border-gray-200 object-cover" />
                  ))}
                </div>
              </div>
            )}
          </div>
          <button type="submit" className="w-full rounded-xl bg-pink-600 px-4 py-3 font-medium text-white hover:bg-pink-700 transition">Save Changes</button>
        </form>
      </AdminModal>

      <AdminModal
        isOpen={isDetailsModalOpen}
        title="Consultation Details"
        onClose={() => setIsDetailsModalOpen(false)}
      >
        {!activeConsultation ? null : (
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase text-gray-500">User</p>
              <p className="text-sm font-semibold text-gray-900">{activeConsultation.user?.name || 'Unknown'}</p>
              <p className="text-xs text-gray-500">{activeConsultation.user?.email || ''}</p>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-500">Title</p>
              <p className="text-sm font-semibold text-gray-900">{activeConsultation.title}</p>
            </div>

            <div>
              <p className="text-xs uppercase text-gray-500">Description</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{activeConsultation.description}</p>
            </div>

            {activeConsultation.adminReply && (
              <div>
                <p className="text-xs uppercase text-gray-500">Admin Reply</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{activeConsultation.adminReply}</p>
              </div>
            )}

            <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
              <p className="text-xs uppercase text-gray-500">Profile Snapshot</p>
              <p className="mt-2 text-sm text-gray-700"><span className="font-semibold">Skin Type:</span> {activeConsultation.profileSnapshot?.skinType || 'N/A'}</p>
              <p className="mt-1 text-sm text-gray-700"><span className="font-semibold">Concerns:</span> {activeConsultation.profileSnapshot?.concerns?.length ? activeConsultation.profileSnapshot.concerns.join(', ') : 'N/A'}</p>
              <p className="mt-1 text-sm text-gray-700"><span className="font-semibold">Allergies:</span> {activeConsultation.profileSnapshot?.allergies?.length ? activeConsultation.profileSnapshot.allergies.join(', ') : 'N/A'}</p>
              <p className="mt-1 text-sm text-gray-700"><span className="font-semibold">Sensitivity:</span> {activeConsultation.profileSnapshot?.sensitivityLevel || 'N/A'}</p>
            </div>

            {Array.isArray(activeConsultation.images) && activeConsultation.images.length > 0 && (
              <div>
                <p className="text-xs uppercase text-gray-500 mb-2">Uploaded Images</p>
                <div className="grid grid-cols-3 gap-3">
                  {activeConsultation.images.map((imagePath) => (
                    <a key={imagePath} href={resolveImageUrl(imagePath)} target="_blank" rel="noreferrer">
                      <img
                        src={resolveImageUrl(imagePath)}
                        alt="Consultation upload"
                        className="h-24 w-full rounded-xl border border-gray-200 object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(activeConsultation.adminReplyImages) && activeConsultation.adminReplyImages.length > 0 && (
              <div>
                <p className="text-xs uppercase text-gray-500 mb-2">Reply Images</p>
                <div className="grid grid-cols-3 gap-3">
                  {activeConsultation.adminReplyImages.map((imagePath) => (
                    <a key={imagePath} href={resolveImageUrl(imagePath)} target="_blank" rel="noreferrer">
                      <img
                        src={resolveImageUrl(imagePath)}
                        alt="Reply upload"
                        className="h-24 w-full rounded-xl border border-gray-200 object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default AdminConsultations;