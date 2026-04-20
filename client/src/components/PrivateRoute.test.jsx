import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import PrivateRoute from './PrivateRoute';
import * as api from '../services/api';

jest.mock('../services/api');

describe('PrivateRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders protected content when authenticated', () => {
    api.isAuthenticated.mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route
            path="/private"
            element={(
              <PrivateRoute>
                <div>Protected page</div>
              </PrivateRoute>
            )}
          />
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected page')).toBeInTheDocument();
  });

  test('redirects unauthenticated users', () => {
    api.isAuthenticated.mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route
            path="/private"
            element={(
              <PrivateRoute>
                <div>Protected page</div>
              </PrivateRoute>
            )}
          />
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Home page')).toBeInTheDocument();
    expect(screen.queryByText('Protected page')).not.toBeInTheDocument();
  });
});