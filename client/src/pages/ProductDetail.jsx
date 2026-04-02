import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, getProductReviews, submitProductReview } from '../services/api';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitMessage, setSubmitMessage] = useState('');

    const loadProduct = async () => {
        setLoading(true);
        setError('');
        try {
            const productData = await getProductById(id);
            setProduct(productData);
            const reviewData = await getProductReviews(id);
            setReviews(reviewData.reviews || []);
            setAverageRating(reviewData.averageRating || 0);
        } catch (err) {
            setError(err.message || 'Unable to load product');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProduct();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitMessage('');
        try {
            await submitProductReview(id, { rating, comment });
            setSubmitMessage('Your review has been submitted.');
            setComment('');
            await loadProduct();
        } catch (err) {
            setSubmitMessage(err.message || 'Unable to submit review');
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-gray-500">Loading product...</div>;
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center text-red-500">
                {error}
                <button onClick={() => navigate('/products')} className="mt-6 px-6 py-3 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition">
                    Back to catalog
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-1/2 rounded-3xl overflow-hidden bg-pink-50 flex items-center justify-center">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-gray-400">No image available</span>
                            )}
                        </div>
                        <div className="md:w-1/2">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                            <p className="text-2xl font-semibold text-pink-600 mb-4">${product.price.toFixed(2)}</p>
                            <p className="text-gray-600 mb-6">{product.description}</p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-3xl bg-pink-50 p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Ingredients</h3>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        {product.ingredients?.map((ingredient, index) => (
                                            <li key={index}>• {ingredient}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="rounded-3xl bg-pink-50 p-4">
                                    <h3 className="font-semibold text-gray-800 mb-2">Benefits</h3>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        {product.benefits?.map((benefit, index) => (
                                            <li key={index}>• {benefit}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Customer reviews</h2>
                        <p className="text-sm text-gray-500 mb-4">Average rating: <span className="font-semibold text-pink-600">{averageRating}</span></p>
                        {reviews.length === 0 ? (
                            <p className="text-gray-500">No reviews yet. Be the first to review this product.</p>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review._id} className="rounded-3xl border border-gray-100 p-4 bg-gray-50">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-gray-900">{review.user?.name || 'Anonymous'}</span>
                                            <span className="text-pink-600 font-semibold">{review.rating}/5</span>
                                        </div>
                                        <p className="text-sm text-gray-700">{review.comment || 'No comment provided.'}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Write a review</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-2">Rating</label>
                                <select
                                    value={rating}
                                    onChange={(e) => setRating(Number(e.target.value))}
                                    className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                                >
                                    {[5,4,3,2,1].map((value) => (
                                        <option key={value} value={value}>{value} star{value > 1 ? 's' : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-2">Comment</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                                    rows={4}
                                    placeholder="Share your experience"
                                />
                            </div>
                            <button type="submit" className="w-full bg-pink-600 text-white px-6 py-3 rounded-2xl hover:bg-pink-700 transition">
                                Submit Review
                            </button>
                            {submitMessage && <p className="text-sm text-pink-600">{submitMessage}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
