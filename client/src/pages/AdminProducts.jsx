import React, { useEffect, useState } from 'react';
import AdminModal from '../components/admin/AdminModal';
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
} from '../services/api';

const initialForm = {
  name: '',
  category: 'General',
  description: '',
  price: '',
  skinType: 'normal',
  concerns: '',
  benefits: '',
  ingredients: '',
  imageUrl: '',
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminProducts();
      setProducts(response.products || []);
    } catch (err) {
      setError(err.message || 'Unable to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name || '',
      category: item.category || 'General',
      description: item.description || '',
      price: item.price ?? '',
      skinType: item.skinTypes?.[0] || 'normal',
      concerns: (item.concerns || []).join(', '),
      benefits: (item.benefits || []).join(', '),
      ingredients: (item.ingredients || []).join(', '),
      imageUrl: item.image || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const payload = {
      ...form,
      price: Number(form.price),
      category: form.category,
      concerns: form.concerns,
      benefits: form.benefits,
      ingredients: form.ingredients,
    };

    try {
      if (editingId) {
        await updateAdminProduct(editingId, payload);
        setMessage('Product updated successfully.');
      } else {
        await createAdminProduct(payload);
        setMessage('Product created successfully.');
      }
      setIsModalOpen(false);
      setForm(initialForm);
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Unable to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteAdminProduct(id);
      setMessage('Product deleted successfully.');
      await loadProducts();
    } catch (err) {
      setError(err.message || 'Unable to delete product');
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-500">Loading products...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Admin Products</h1>
        <button onClick={openCreate} className="rounded-full bg-pink-600 px-5 py-2 text-sm font-medium text-white hover:bg-pink-700 transition">Add Product</button>
      </div>

      {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
      {message && <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-3 text-green-700">{message}</div>}

      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Skin Type</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item._id} className="border-t border-gray-200">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                </td>
                <td className="px-4 py-3 text-gray-700">${Number(item.price || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-700">{item.skinTypes?.[0] || 'n/a'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => openEdit(item)} className="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs text-blue-700 hover:bg-blue-100">Edit</button>
                    <button onClick={() => handleDelete(item._id)} className="rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal isOpen={isModalOpen} title={editingId ? 'Edit Product' : 'Add Product'} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSave} className="space-y-4">
          <input className="w-full rounded-xl border border-gray-300 px-4 py-3" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <select className="w-full rounded-xl border border-gray-300 px-4 py-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="Cleanser">Cleanser</option>
            <option value="Toner">Toner</option>
            <option value="Serum">Serum</option>
            <option value="Moisturizer">Moisturizer</option>
            <option value="Sunscreen">Sunscreen</option>
            <option value="General">General</option>
          </select>
          <textarea className="w-full rounded-xl border border-gray-300 px-4 py-3" rows={4} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <input type="number" min="0" step="0.01" className="w-full rounded-xl border border-gray-300 px-4 py-3" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <select className="w-full rounded-xl border border-gray-300 px-4 py-3" value={form.skinType} onChange={(e) => setForm({ ...form, skinType: e.target.value })}>
            <option value="oily">Oily</option>
            <option value="dry">Dry</option>
            <option value="combination">Combination</option>
            <option value="sensitive">Sensitive</option>
            <option value="normal">Normal</option>
          </select>
          <input className="w-full rounded-xl border border-gray-300 px-4 py-3" placeholder="Concerns (comma separated)" value={form.concerns} onChange={(e) => setForm({ ...form, concerns: e.target.value })} />
          <input className="w-full rounded-xl border border-gray-300 px-4 py-3" placeholder="Benefits (comma separated)" value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} />
          <input className="w-full rounded-xl border border-gray-300 px-4 py-3" placeholder="Ingredients (comma separated)" value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} />
          <input className="w-full rounded-xl border border-gray-300 px-4 py-3" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          <button type="submit" className="w-full rounded-xl bg-pink-600 px-4 py-3 font-medium text-white hover:bg-pink-700 transition">{editingId ? 'Update Product' : 'Create Product'}</button>
        </form>
      </AdminModal>
    </div>
  );
};

export default AdminProducts;