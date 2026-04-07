import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalProducts: 0, totalArticles: 0, totalConsultations: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadDashboard = async () => {
        setLoading(true);
        setError('');
        try {
            const { stats: fetchedStats } = await getAdminStats();
            setStats(fetchedStats || {});
        } catch (err) {
            setError(err.message || 'Unable to load admin dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    if (loading) {
        return <div className="text-center py-20 text-gray-500">Loading admin dashboard...</div>;
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-pink-600">Admin Dashboard</h1>
                <p className="mt-2 text-gray-600">Overview of platform activity and quick access to management modules.</p>
            </div>

            {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalUsers ?? stats.users ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">Total Products</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalProducts ?? stats.products ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">Total Articles</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalArticles ?? stats.articles ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">Total Consultations</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalConsultations ?? stats.consultations ?? 0}</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Link to="/admin/products" className="rounded-2xl border border-pink-200 bg-pink-50 p-5 hover:bg-pink-100 transition">
                    <h3 className="text-lg font-semibold text-pink-700">Manage Products</h3>
                    <p className="mt-1 text-sm text-gray-600">Create, edit, and remove products.</p>
                </Link>
                <Link to="/admin/users" className="rounded-2xl border border-blue-200 bg-blue-50 p-5 hover:bg-blue-100 transition">
                    <h3 className="text-lg font-semibold text-blue-700">Manage Users</h3>
                    <p className="mt-1 text-sm text-gray-600">Promote roles and remove accounts.</p>
                </Link>
                <Link to="/admin/articles" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 hover:bg-rose-100 transition">
                    <h3 className="text-lg font-semibold text-rose-700">Manage Articles</h3>
                    <p className="mt-1 text-sm text-gray-600">Publish and edit educational content.</p>
                </Link>
                <Link to="/admin/consultations" className="rounded-2xl border border-purple-200 bg-purple-50 p-5 hover:bg-purple-100 transition">
                    <h3 className="text-lg font-semibold text-purple-700">Manage Consultations</h3>
                    <p className="mt-1 text-sm text-gray-600">Respond to and resolve user requests.</p>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
