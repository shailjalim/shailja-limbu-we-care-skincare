import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Products', to: '/admin/products' },
  { label: 'Users', to: '/admin/users' },
  { label: 'Articles', to: '/admin/articles' },
  { label: 'Consultations', to: '/admin/consultations' },
];

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[250px_1fr]">
        <aside className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm h-fit lg:sticky lg:top-24">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            <p className="text-sm text-gray-500">Manage platform resources</p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-pink-600 text-white' : 'text-gray-700 hover:bg-pink-50 hover:text-pink-700'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to="/dashboard"
            className="mt-6 inline-block w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Back to User Dashboard
          </Link>
        </aside>

        <main className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;