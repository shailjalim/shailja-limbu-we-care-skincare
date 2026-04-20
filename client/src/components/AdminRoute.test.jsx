import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import AdminRoute from './AdminRoute';
import * as api from '../services/api';

jest.mock('../services/api');

describe('AdminRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders children for authenticated admin user', () => {
    api.isAuthenticated.mockReturnValue(true);
    api.getUser.mockReturnValue({ role: 'admin' });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={(
              <AdminRoute>
                <div>Admin page</div>
              </AdminRoute>
            )}
          />
          <Route path="/" element={<div>Home page</div>} />
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin page')).toBeInTheDocument();
  });

  test('redirects unauthenticated users to home page', () => {
    api.isAuthenticated.mockReturnValue(false);
    api.getUser.mockReturnValue(null);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={(
              <AdminRoute>
                <div>Admin page</div>
              </AdminRoute>
            )}
          />
          <Route path="/" element={<div>Home page</div>} />
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Home page')).toBeInTheDocument();
  });

  test('redirects authenticated non-admin users to dashboard', () => {
    api.isAuthenticated.mockReturnValue(true);
    api.getUser.mockReturnValue({ role: 'user' });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={(
              <AdminRoute>
                <div>Admin page</div>
              </AdminRoute>
            )}
          />
          <Route path="/" element={<div>Home page</div>} />
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
    expect(screen.queryByText('Admin page')).not.toBeInTheDocument();
  });
});