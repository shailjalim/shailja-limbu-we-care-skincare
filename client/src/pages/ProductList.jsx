import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [ingredient, setIngredient] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const runSearch = useCallback(async (params = {}) => {
        setLoading(true);
        setError('');
        try {
            const response = await getProducts(params);
            setProducts(response);
        } catch (err) {
            setError(err.message || 'Unable to load products');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        runSearch({});
    }, [runSearch]);

    const handleSearch = async (e) => {
        e.preventDefault();
        const params = {};
        if (search) params.search = search;
        if (ingredient) params.ingredient = ingredient;
        await runSearch(params);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-pink-600">Skincare Product Catalog</h1>
                    <p className="mt-2 text-gray-600">Browse curated skincare products, filter by ingredients, and read reviews.</p>
                </div>
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <input
                        type="text"
                        className="w-full sm:w-64 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                        placeholder="Search products"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <input
                        type="text"
                        className="w-full sm:w-64 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                        placeholder="Filter by ingredient"
                        value={ingredient}
                        onChange={(e) => setIngredient(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-pink-600 text-white px-6 py-3 rounded-xl hover:bg-pink-700 transition"
                    >
                        Search
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading products...</div>
            ) : error ? (
                <div className="text-center py-20 text-red-500">{error}</div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 text-gray-500">No products found.</div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                        <Link key={product._id} to={`/products/${product._id}`} className="group block border border-gray-200 rounded-3xl p-6 transition hover:shadow-xl hover:border-pink-200">
                            <div className="h-44 w-full overflow-hidden rounded-3xl bg-pink-50 flex items-center justify-center mb-6">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="max-h-full object-contain" />
                                ) : (
                                    <span className="text-gray-400">No image</span>
                                )}
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h2>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-3">{product.description}</p>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>{product.ingredients?.slice(0, 2).join(', ')}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductList;
