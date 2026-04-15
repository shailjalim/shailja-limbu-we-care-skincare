import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    changeAccountPassword,
    deactivateAccount,
    getAccountProfile,
    getMyConsultations,
    logout,
    removeAccountProfileImage,
    resolveImageUrl,
    updateAccountProfile,
    uploadAccountProfileImage,
} from '../services/api';

const MAX_NAME_LENGTH = 50;

const Profile = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [savingName, setSavingName] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [savingImage, setSavingImage] = useState(false);
    const [deactivating, setDeactivating] = useState(false);

    const [account, setAccount] = useState(null);
    const [inbox, setInbox] = useState([]);

    const [name, setName] = useState('');
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const initials = useMemo(() => {
        if (!account?.name) return 'U';
        return account.name.trim().charAt(0).toUpperCase();
    }, [account?.name]);

    useEffect(() => {
        const loadProfileData = async () => {
            setLoading(true);
            setError('');

            try {
                const [accountResponse, consultationResponse] = await Promise.all([
                    getAccountProfile(),
                    getMyConsultations(),
                ]);

                if (accountResponse?.success && accountResponse.user) {
                    setAccount(accountResponse.user);
                    setName(accountResponse.user.name || '');
                }

                const consultations = Array.isArray(consultationResponse?.consultations)
                    ? consultationResponse.consultations
                    : [];
                setInbox(consultations);
            } catch (err) {
                setError(err.message || 'Unable to load account information.');
            } finally {
                setLoading(false);
            }
        };

        loadProfileData();
    }, []);

    const clearNotices = () => {
        setError('');
        setSuccess('');
    };

    const handleSaveName = async (e) => {
        e.preventDefault();
        clearNotices();

        const trimmed = String(name || '').trim();
        if (!trimmed) {
            setError('Full name is required.');
            return;
        }

        if (trimmed.length > MAX_NAME_LENGTH) {
            setError(`Full name cannot exceed ${MAX_NAME_LENGTH} characters.`);
            return;
        }

        setSavingName(true);
        try {
            const response = await updateAccountProfile({ name: trimmed });
            setAccount(response.user);
            setSuccess('Basic account information updated.');
        } catch (err) {
            setError(err.message || 'Unable to update account information.');
        } finally {
            setSavingName(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        clearNotices();

        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setError('Please fill all password fields.');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setError('New password must be at least 6 characters long.');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('New password and confirmation do not match.');
            return;
        }

        setSavingPassword(true);
        try {
            await changeAccountPassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setSuccess('Password changed successfully.');
        } catch (err) {
            setError(err.message || 'Unable to change password.');
        } finally {
            setSavingPassword(false);
        }
    };

    const handleUploadImage = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) return;

        clearNotices();
        setSavingImage(true);

        try {
            const response = await uploadAccountProfileImage(file);
            setAccount((prev) => ({ ...(prev || {}), profileImage: response.profileImage }));
            setSuccess('Profile picture updated.');
        } catch (err) {
            setError(err.message || 'Unable to upload profile picture.');
        } finally {
            setSavingImage(false);
        }
    };

    const handleRemoveImage = async () => {
        clearNotices();
        setSavingImage(true);

        try {
            await removeAccountProfileImage();
            setAccount((prev) => ({ ...(prev || {}), profileImage: null }));
            setSuccess('Profile picture removed.');
        } catch (err) {
            setError(err.message || 'Unable to remove profile picture.');
        } finally {
            setSavingImage(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleDeactivate = async () => {
        clearNotices();

        const confirmed = window.confirm('Are you sure you want to deactivate your account? You will be logged out immediately.');
        if (!confirmed) return;

        setDeactivating(true);
        try {
            await deactivateAccount();
            logout();
            navigate('/');
        } catch (err) {
            setError(err.message || 'Unable to deactivate account.');
        } finally {
            setDeactivating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600 mt-4">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6">
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your account, security settings, communication, and account controls.</p>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-6">
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{error}</div>
                )}

                {success && (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-700 text-sm">{success}</div>
                )}

                <section className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Basic Account Information</h2>

                    <div className="grid md:grid-cols-[220px_1fr] gap-6">
                        <div className="space-y-3">
                            <div className="w-28 h-28 rounded-full border border-gray-200 overflow-hidden bg-pink-50 flex items-center justify-center">
                                {account?.profileImage ? (
                                    <img
                                        src={resolveImageUrl(account.profileImage)}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl font-semibold text-pink-600">{initials}</span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <label className="px-3 py-2 text-xs font-medium rounded-lg border border-pink-300 text-pink-700 hover:bg-pink-50 cursor-pointer">
                                    {account?.profileImage ? 'Change Photo' : 'Add Photo'}
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg"
                                        onChange={handleUploadImage}
                                        className="hidden"
                                        disabled={savingImage}
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    disabled={!account?.profileImage || savingImage}
                                    className="px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Remove
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">JPG/PNG up to 2MB</p>
                        </div>

                        <form onSubmit={handleSaveName} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    maxLength={MAX_NAME_LENGTH}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={account?.email || ''}
                                    readOnly
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-gray-600"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={savingName}
                                className="px-5 py-2 rounded-full bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 disabled:opacity-60"
                            >
                                {savingName ? 'Saving...' : 'Save Basic Info'}
                            </button>
                        </form>
                    </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Security Settings</h2>
                    <form onSubmit={handlePasswordChange} className="grid md:grid-cols-3 gap-4">
                        <input
                            type="password"
                            placeholder="Current password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                            className="rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200"
                        />
                        <input
                            type="password"
                            placeholder="New password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                            className="rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200"
                        />
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                            className="rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-200"
                        />
                        <div className="md:col-span-3">
                            <button
                                type="submit"
                                disabled={savingPassword}
                                className="px-5 py-2 rounded-full bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 disabled:opacity-60"
                            >
                                {savingPassword ? 'Updating...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                </section>

                <section className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Communication Section</h2>
                    <div className="space-y-3">
                        {inbox.length === 0 ? (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                                Messages/Support inbox is empty. Your consultation replies will appear here.
                            </div>
                        ) : (
                            inbox.slice(0, 6).map((item) => (
                                <div key={item._id} className="rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-semibold text-gray-900">{item.title || 'Consultation Request'}</p>
                                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 uppercase">{item.status || 'pending'}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.adminReply || 'No admin reply yet.'}</p>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-4">
                        <Link
                            to="/contact"
                            className="inline-flex items-center px-4 py-2 rounded-full border border-pink-300 text-pink-700 hover:bg-pink-50 text-sm font-medium"
                        >
                            Contact Support
                        </Link>
                    </div>
                </section>

                <section className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Control</h2>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="px-5 py-2 rounded-full border border-pink-600 text-pink-600 hover:bg-pink-50 text-sm font-medium"
                        >
                            Logout
                        </button>
                        <button
                            type="button"
                            onClick={handleDeactivate}
                            disabled={deactivating}
                            className="px-5 py-2 rounded-full border border-red-500 text-red-600 hover:bg-red-50 text-sm font-medium disabled:opacity-60"
                        >
                            {deactivating ? 'Deleting...' : 'Delete Account'}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                        Delete account will deactivate your account for compliance and prevent future login.
                    </p>
                </section>
            </main>
        </div>
    );
};

export default Profile;
