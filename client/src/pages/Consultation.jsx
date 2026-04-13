import React, { useEffect, useState } from 'react';
import { getMyConsultations, requestConsultation } from '../services/api';

const MAX_IMAGE_COUNT = 3;
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const getStatusBadgeClasses = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-700';
    if (status === 'in-progress') return 'bg-blue-100 text-blue-700';
    return 'bg-yellow-100 text-yellow-700';
};

const resolveImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;

    const configuredApiUrl = process.env.REACT_APP_API_URL;
    if (configuredApiUrl && configuredApiUrl.startsWith('http')) {
        return `${configuredApiUrl.replace(/\/?api\/?$/, '')}${imagePath}`;
    }

    return `http://localhost:5000${imagePath}`;
};

const Consultation = () => {
    const [consultations, setConsultations] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const loadConsultations = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getMyConsultations();
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

    useEffect(() => {
        return () => {
            previewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const handleImageChange = (e) => {
        const incomingFiles = Array.from(e.target.files || []);
        setError('');

        if (incomingFiles.length > MAX_IMAGE_COUNT) {
            setError('You can upload up to 3 images per consultation.');
            e.target.value = '';
            return;
        }

        const invalidFile = incomingFiles.find(
            (file) => !ALLOWED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_SIZE_BYTES
        );

        if (invalidFile) {
            setError('Only JPG, JPEG, or PNG files up to 2MB are allowed.');
            e.target.value = '';
            return;
        }

        previewUrls.forEach((url) => URL.revokeObjectURL(url));
        const nextPreviewUrls = incomingFiles.map((file) => URL.createObjectURL(file));
        setSelectedImages(incomingFiles);
        setPreviewUrls(nextPreviewUrls);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const cleanedTitle = title.trim();
        const cleanedDescription = description.trim();

        if (!cleanedTitle || !cleanedDescription) {
            setError('Title and description are required.');
            return;
        }

        setSubmitting(true);
        try {
            await requestConsultation({
                title: cleanedTitle,
                description: cleanedDescription,
                images: selectedImages,
            });

            setTitle('');
            setDescription('');
            setSelectedImages([]);
            previewUrls.forEach((url) => URL.revokeObjectURL(url));
            setPreviewUrls([]);
            setMessage('Consultation requested successfully.');
            await loadConsultations();
        } catch (err) {
            setError(err.message || 'Unable to submit consultation request');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-pink-600">Dermatologist Consultation</h1>
                <p className="text-gray-600 mt-2">Submit your skin concern and get expert suggestions when your subscription is active.</p>
            </div>
            {error && <div className="mb-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
            {message && <div className="mb-4 rounded-3xl border border-green-200 bg-green-50 p-4 text-green-700">{message}</div>}
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Request Consultation</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full rounded-3xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                maxLength={120}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                className="w-full rounded-3xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                placeholder="Describe your concern and relevant skin history"
                                maxLength={2000}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Images (optional, up to 3)</label>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                multiple
                                onChange={handleImageChange}
                                className="w-full rounded-3xl border border-gray-200 px-4 py-3 file:mr-4 file:rounded-full file:border-0 file:bg-pink-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-pink-700 hover:file:bg-pink-100"
                            />
                            {previewUrls.length > 0 && (
                                <div className="mt-3 grid grid-cols-3 gap-3">
                                    {previewUrls.map((url, index) => (
                                        <img
                                            key={`${url}-${index}`}
                                            src={url}
                                            alt={`Selected preview ${index + 1}`}
                                            className="h-20 w-full rounded-xl border border-gray-200 object-cover"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        <button type="submit" className="w-full rounded-3xl bg-pink-600 px-6 py-3 text-white font-medium hover:bg-pink-700 transition">
                            {submitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </form>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Requests</h2>
                    {loading ? (
                        <p className="text-gray-500">Loading your consultation requests...</p>
                    ) : consultations.length === 0 ? (
                        <p className="text-gray-500">You have not requested a consultation yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {consultations.map((item) => (
                                <div key={item._id} className="rounded-3xl border border-gray-100 p-4 bg-gray-50">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                            <p className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    {item.description && <p className="mt-3 text-sm text-gray-600 whitespace-pre-line">{item.description}</p>}

                                    {Array.isArray(item.images) && item.images.length > 0 && (
                                        <div className="mt-4 grid grid-cols-3 gap-3">
                                            {item.images.map((imagePath) => (
                                                <a key={imagePath} href={resolveImageUrl(imagePath)} target="_blank" rel="noreferrer">
                                                    <img
                                                        src={resolveImageUrl(imagePath)}
                                                        alt="Consultation upload"
                                                        className="h-20 w-full rounded-xl border border-gray-200 object-cover"
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Profile Snapshot</p>
                                        <p className="mt-2 text-sm text-gray-700"><span className="font-semibold">Skin Type:</span> {item.profileSnapshot?.skinType || 'N/A'}</p>
                                        <p className="mt-1 text-sm text-gray-700"><span className="font-semibold">Concerns:</span> {item.profileSnapshot?.concerns?.length ? item.profileSnapshot.concerns.join(', ') : 'N/A'}</p>
                                        <p className="mt-1 text-sm text-gray-700"><span className="font-semibold">Allergies:</span> {item.profileSnapshot?.allergies?.length ? item.profileSnapshot.allergies.join(', ') : 'N/A'}</p>
                                        <p className="mt-1 text-sm text-gray-700"><span className="font-semibold">Sensitivity:</span> {item.profileSnapshot?.sensitivityLevel || 'N/A'}</p>
                                    </div>

                                    {item.adminReply && (
                                        <div className="mt-3 rounded-3xl bg-white border border-gray-200 p-4">
                                            <p className="text-sm font-semibold text-gray-900">Admin Reply</p>
                                            <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{item.adminReply}</p>

                                            {Array.isArray(item.adminReplyImages) && item.adminReplyImages.length > 0 && (
                                                <div className="mt-3 grid grid-cols-3 gap-3">
                                                    {item.adminReplyImages.map((imagePath) => (
                                                        <a key={imagePath} href={resolveImageUrl(imagePath)} target="_blank" rel="noreferrer">
                                                            <img
                                                                src={resolveImageUrl(imagePath)}
                                                                alt="Admin reply attachment"
                                                                className="h-20 w-full rounded-xl border border-gray-200 object-cover"
                                                            />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Consultation;
