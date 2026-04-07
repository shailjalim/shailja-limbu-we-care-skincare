import React, { useEffect, useState } from 'react';
import AdminModal from '../components/admin/AdminModal';
import {
  createAdminArticle,
  deleteAdminArticle,
  getAdminArticles,
  updateAdminArticle,
} from '../services/api';

const initialForm = {
  title: '',
  category: 'general',
  content: '',
  tags: '',
};

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const loadArticles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminArticles();
      setArticles(response.articles || []);
    } catch (err) {
      setError(err.message || 'Unable to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEdit = (article) => {
    setEditingId(article._id);
    setForm({
      title: article.title || '',
      category: article.category || 'general',
      content: article.content || '',
      tags: (article.tags || []).join(', '),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (editingId) {
        await updateAdminArticle(editingId, form);
        setMessage('Article updated successfully.');
      } else {
        await createAdminArticle(form);
        setMessage('Article created successfully.');
      }
      setIsModalOpen(false);
      setForm(initialForm);
      await loadArticles();
    } catch (err) {
      setError(err.message || 'Unable to save article');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await deleteAdminArticle(id);
      setMessage('Article deleted successfully.');
      await loadArticles();
    } catch (err) {
      setError(err.message || 'Unable to delete article');
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-500">Loading articles...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Admin Articles</h1>
        <button onClick={openCreate} className="rounded-full bg-pink-600 px-5 py-2 text-sm font-medium text-white hover:bg-pink-700 transition">Add Article</button>
      </div>

      {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
      {message && <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-green-700">{message}</div>}

      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article._id} className="border-t border-gray-200">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{article.title}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{article.content}</p>
                </td>
                <td className="px-4 py-3 capitalize text-gray-700">{article.category}</td>
                <td className="px-4 py-3 text-gray-700">{(article.tags || []).join(', ')}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => openEdit(article)} className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs text-blue-700 hover:bg-blue-100">Edit</button>
                    <button onClick={() => handleDelete(article._id)} className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal isOpen={isModalOpen} title={editingId ? 'Edit Article' : 'Add Article'} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4">
          <input className="w-full rounded-xl border border-gray-300 px-4 py-3" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <select className="w-full rounded-xl border border-gray-300 px-4 py-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="acne">Acne</option>
            <option value="oily">Oily</option>
            <option value="dryness">Dry</option>
            <option value="sensitive">Sensitive</option>
            <option value="general">General</option>
          </select>
          <textarea className="w-full rounded-xl border border-gray-300 px-4 py-3" rows={8} placeholder="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          <input className="w-full rounded-xl border border-gray-300 px-4 py-3" placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <button type="submit" className="w-full rounded-xl bg-pink-600 px-4 py-3 font-medium text-white hover:bg-pink-700 transition">{editingId ? 'Update Article' : 'Create Article'}</button>
        </form>
      </AdminModal>
    </div>
  );
};

export default AdminArticles;