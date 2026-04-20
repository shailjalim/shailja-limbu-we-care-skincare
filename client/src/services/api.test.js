import {
  clearAuthData,
  getStoredUser,
  getToken,
  isAuthenticated,
  removeStoredUser,
  removeToken,
  resolveImageUrl,
  setStoredUser,
  setToken,
} from './api';

describe('api service helpers', () => {
  const ORIGINAL_API_URL = process.env.REACT_APP_API_URL;

  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    if (ORIGINAL_API_URL === undefined) {
      delete process.env.REACT_APP_API_URL;
    } else {
      process.env.REACT_APP_API_URL = ORIGINAL_API_URL;
    }
  });

  test('token helpers set, get, and remove session token', () => {
    expect(getToken()).toBeNull();
    setToken('abc123');
    expect(getToken()).toBe('abc123');
    removeToken();
    expect(getToken()).toBeNull();
  });

  test('user helpers set, get, and remove session user', () => {
    expect(getStoredUser()).toBeNull();

    const user = { id: 'u1', role: 'admin' };
    setStoredUser(user);

    expect(getStoredUser()).toEqual(user);

    removeStoredUser();
    expect(getStoredUser()).toBeNull();
  });

  test('clearAuthData removes token and user', () => {
    setToken('token');
    setStoredUser({ id: 'u1' });

    clearAuthData();

    expect(getToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  test('resolveImageUrl keeps absolute urls unchanged', () => {
    expect(resolveImageUrl('https://cdn.example.com/image.png')).toBe('https://cdn.example.com/image.png');
  });

  test('resolveImageUrl prefixes relative path with api origin when env url is absolute', () => {
    process.env.REACT_APP_API_URL = 'https://api.example.com/api';
    expect(resolveImageUrl('/uploads/a.png')).toBe('https://api.example.com/uploads/a.png');
  });

  test('resolveImageUrl returns relative input when api url is not absolute', () => {
    process.env.REACT_APP_API_URL = '/api';
    expect(resolveImageUrl('/uploads/a.png')).toBe('/uploads/a.png');
  });

  test('resolveImageUrl returns empty string for empty input', () => {
    expect(resolveImageUrl('')).toBe('');
    expect(resolveImageUrl(null)).toBe('');
  });

  test('isAuthenticated reflects token existence', () => {
    expect(isAuthenticated()).toBe(false);
    setToken('present-token');
    expect(isAuthenticated()).toBe(true);
  });
});