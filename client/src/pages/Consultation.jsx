import React, { useEffect, useState } from 'react';
import { getMyConsultations, requestConsultation } from '../services/api';

const Consultation = () => {
    const [consultations, setConsultations] = useState([]);
    const [concern, setConcern] = useState('');
    const [details, setDetails] = useState('');
    const [loading, setLoading] = useState(true);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await requestConsultation({ concern, details });
            setConcern('');
            setDetails('');
            setMessage('Consultation requested successfully.');
            loadConsultations();
        } catch (err) {
            setError(err.message || 'Unable to submit consultation request');
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Skin Concern</label>
                            <input
                                type="text"
                                value={concern}
                                onChange={(e) => setConcern(e.target.value)}
                                className="w-full rounded-3xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                rows={5}
                                className="w-full rounded-3xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                placeholder="Describe your concern and relevant skin history"
                            />
                        </div>
                        <button type="submit" className="w-full rounded-3xl bg-pink-600 px-6 py-3 text-white font-medium hover:bg-pink-700 transition">
                            Submit Request
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
                                            <h3 className="font-semibold text-gray-900">{item.concern}</h3>
                                            <p className="text-sm text-gray-500">{new Date(item.requestedAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    {item.details && <p className="mt-3 text-sm text-gray-600">{item.details}</p>}
                                    {item.response && (
                                        <div className="mt-3 rounded-3xl bg-white border border-gray-200 p-4">
                                            <p className="text-sm font-semibold text-gray-900">Response</p>
                                            <p className="mt-2 text-sm text-gray-600">{item.response}</p>
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
