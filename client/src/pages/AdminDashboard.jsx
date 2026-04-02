import React, { useEffect, useState } from 'react';
import { getAdminStats, getUsers, updateUserRole, deleteUser, getProducts, createProduct, deleteProduct } from '../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, products: 0, reviews: 0 });
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', ingredients: '', benefits: '', image: '' });

    const loadDashboard = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const [{ stats: fetchedStats }, userResponse, productList] = await Promise.all([
                getAdminStats(),
                getUsers(),
                getProducts(),
            ]);
            setStats(fetchedStats);
            setUsers(userResponse.users);
            setProducts(productList);
        } catch (err) {
            setError(err.message || 'Unable to load admin dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const handleRoleChange = async (userId, role) => {
        try {
            await updateUserRole(userId, role);
            setMessage('User role updated successfully.');
            await loadDashboard();
        } catch (err) {
            setError(err.message || 'Unable to update role');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await deleteUser(userId);
            setMessage('User deleted successfully.');
            await loadDashboard();
        } catch (err) {
            setError(err.message || 'Unable to delete user');
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const payload = {
                ...newProduct,
                price: Number(newProduct.price),
                ingredients: newProduct.ingredients.split(',').map((item) => item.trim()).filter(Boolean),
                benefits: newProduct.benefits.split(',').map((item) => item.trim()).filter(Boolean),
            };

            await createProduct(payload);
            setNewProduct({ name: '', price: '', description: '', ingredients: '', benefits: '', image: '' });
            setMessage('Product created successfully.');
            await loadDashboard();
        } catch (err) {
            setError(err.message || 'Unable to create product');
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await deleteProduct(productId);
            setMessage('Product deleted successfully.');
            await loadDashboard();
        } catch (err) {
            setError(err.message || 'Unable to delete product');
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-gray-500">Loading admin dashboard...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-pink-600">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-2">Manage users, products, and high-level platform data.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
                    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="text-sm text-gray-500 uppercase tracking-wide">Users</h3>
                        <p className="text-3xl font-bold text-gray-900">{stats.users}</p>
                    </div>
                    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="text-sm text-gray-500 uppercase tracking-wide">Products</h3>
                        <p className="text-3xl font-bold text-gray-900">{stats.products}</p>
                    </div>
                    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="text-sm text-gray-500 uppercase tracking-wide">Reviews</h3>
                        <p className="text-3xl font-bold text-gray-900">{stats.reviews}</p>
                    </div>
                </div>
            </div>

            {error && <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
            {message && <div className="mb-6 rounded-3xl border border-green-200 bg-green-50 p-4 text-green-700">{message}</div>}

            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
                <section className="space-y-8">
                    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Manage Users</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-700">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-4 font-medium text-gray-900">{user.name}</td>
                                            <td className="px-4 py-4 text-gray-600">{user.email}</td>
                                            <td className="px-4 py-4 capitalize">{user.role}</td>
                                            <td className="px-4 py-4 space-x-2">
                                                <button
                                                    onClick={() => handleRoleChange(user._id, user.role === 'admin' ? 'user' : 'admin')}
                                                    className="inline-flex items-center rounded-full border border-pink-600 bg-pink-50 px-4 py-2 text-sm font-medium text-pink-700 hover:bg-pink-100 transition"
                                                >
                                                    {user.role === 'admin' ? 'Demote' : 'Promote'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="inline-flex items-center rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Product Catalog</h2>
                        <div className="space-y-4">
                            {products.length === 0 ? (
                                <p className="text-gray-500">No products available yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {products.map((product) => (
                                        <div key={product._id} className="flex flex-col gap-3 rounded-3xl border border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                                <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteProduct(product._id)}
                                                className="inline-flex items-center rounded-full border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-5">Create New Product</h2>
                    <form onSubmit={handleCreateProduct} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                className="w-full rounded-3xl border border-gray-200 px-4 py-3 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Price</label>
                            <input
                                type="number"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                className="w-full rounded-3xl border border-gray-200 px-4 py-3 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                className="w-full rounded-3xl border border-gray-200 px-4 py-3 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                rows={4}
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Ingredients (comma-separated)</label>
                            <input
                                type="text"
                                value={newProduct.ingredients}
                                onChange={(e) => setNewProduct({ ...newProduct, ingredients: e.target.value })}
                                className="w-full rounded-3xl border border-gray-200 px-4 py-3 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Benefits (comma-separated)</label>
                            <input
                                type="text"
                                value={newProduct.benefits}
                                onChange={(e) => setNewProduct({ ...newProduct, benefits: e.target.value })}
                                className="w-full rounded-3xl border border-gray-200 px-4 py-3 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Image URL</label>
                            <input
                                type="text"
                                value={newProduct.image}
                                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                                className="w-full rounded-3xl border border-gray-200 px-4 py-3 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
                            />
                        </div>
                        <button type="submit" className="w-full rounded-3xl bg-pink-600 px-6 py-3 text-white font-medium hover:bg-pink-700 transition">
                            Create Product
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
