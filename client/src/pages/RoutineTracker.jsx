import React, { useEffect, useState } from 'react';
import {
    getRoutines,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    getAllProducts,
    getSkinProfile,
} from '../services/api';

const STEP_NAMES = ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen'];

const RoutineTracker = () => {
    const [routines, setRoutines] = useState([]);
    const [products, setProducts] = useState([]);
    const [productCategories, setProductCategories] = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [routineType, setRoutineType] = useState('morning');
    const [selectedProducts, setSelectedProducts] = useState({});
    const [selectedRoutineId, setSelectedRoutineId] = useState(null);
    const [userSkinType, setUserSkinType] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const loadRoutines = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getRoutines();
            setRoutines(response.routines || []);
        } catch (err) {
            setError(err.message || 'Unable to load routines');
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const response = await getAllProducts();
            const allProducts = response.products || [];
            setProducts(allProducts);
            const categories = Array.from(new Set(allProducts.map((p) => p.category || 'General')));
            setProductCategories(categories);
        } catch (err) {
            console.warn('Unable to load products', err);
        }
    };

    const loadProfileToSuggest = async () => {
        try {
            const response = await getSkinProfile();
            if (response.success && response.profile?.skinType) {
                setUserSkinType(response.profile.skinType);
                const type = response.profile.skinType === 'night' ? 'night' : 'morning';
                if (!selectedRoutineId) setRoutineType(type);
            }
        } catch (err) {
            // no profile yet, ignore
        }
    };

    useEffect(() => {
        loadRoutines();
        loadProducts();
        loadProfileToSuggest();
    }, []);

    useEffect(() => {
        if (routineType === 'night') {
            setSelectedProducts((prev) => {
                const next = { ...prev };
                delete next.Sunscreen;
                return next;
            });
        }
    }, [routineType]);

    const handleSelectProduct = (stepName, value) => {
        setSelectedProducts((prev) => ({ ...prev, [stepName]: value }));
    };

    const resetForm = () => {
        setRoutineType('morning');
        setSelectedProducts({});
        setSelectedRoutineId(null);
    };

    const buildStepsPayload = () => {
        const baseSteps = STEP_NAMES.filter((step) => !(routineType === 'night' && step === 'Sunscreen'));

        return baseSteps.map((stepName) => ({
            step_name: stepName,
            product_id: selectedProducts[stepName] || null,
        }));
    };

    const validateForm = () => {
        const steps = buildStepsPayload();
        for (const step of steps) {
            if (!step.product_id) {
                return `Please select a product for: ${step.step_name}`;
            }
        }
        return null;
    };

    const getRecommendedRoutine = (skinType) => {
        const baseSteps = ['Cleanser', 'Toner', 'Serum', 'Moisturizer'];

        const recommendation = {
            oily: [...baseSteps, 'Sunscreen'],
            dry: [...baseSteps, 'Moisturizer', 'Sunscreen'],
            combination: [...baseSteps, 'Sunscreen'],
            sensitive: [...baseSteps, 'Serum', 'Moisturizer', 'Sunscreen'],
            normal: [...baseSteps, 'Sunscreen'],
        };

        return recommendation[skinType] || [...baseSteps, 'Sunscreen'];
    };

    const applyRecommendedRoutine = () => {
        const skinType = userSkinType || 'normal';
        const recommendedSteps = getRecommendedRoutine(skinType);

        if (recommendedSteps.includes('Sunscreen') && routineType === 'night') {
            setRoutineType('morning');
        }

        const mapping = {};
        recommendedSteps.forEach((stepName) => {
            const matchedProduct = products.find((p) => p.category?.toLowerCase().includes(stepName.toLowerCase()) || p.name?.toLowerCase().includes(stepName.toLowerCase()));
            if (matchedProduct) {
                mapping[stepName] = matchedProduct._id;
            }
        });

        setSelectedProducts(mapping);
        setMessage('Recommended routine loaded. Please adjust and save.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        const steps = buildStepsPayload();

        try {
            if (selectedRoutineId) {
                await updateRoutine(selectedRoutineId, { routine_type: routineType, steps });
                setMessage('Routine updated successfully');
            } else {
                await createRoutine({ routine_type: routineType, steps });
                setMessage('Routine created successfully');
            }
            resetForm();
            loadRoutines();
        } catch (err) {
            setError(err.message || 'Failed to save routine');
        }
    };

    const handleEdit = (routine) => {
        setSelectedRoutineId(routine._id);
        setRoutineType(routine.routine_type);
        const mapping = {};
        (routine.steps || []).forEach((step) => {
            mapping[step.step_name] = step.product_id?._id || step.product_id;
        });
        setSelectedProducts(mapping);
        setMessage('');
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        setError('');
        setMessage('');
        try {
            await deleteRoutine(id);
            setMessage('Routine deleted successfully');
            if (selectedRoutineId === id) resetForm();
            loadRoutines();
        } catch (err) {
            setError(err.message || 'Unable to delete routine');
        }
    };

    const handleToggleActive = async (routine) => {
        setError('');
        setMessage('');
        try {
            await updateRoutine(routine._id, { isActive: !routine.isActive, routine_type: routine.routine_type, steps: routine.steps });
            setMessage('Routine status updated');
            loadRoutines();
        } catch (err) {
            setError(err.message || 'Unable to update routine');
        }
    };

    const getProductName = (productId) => {
        const prod = products.find((p) => String(p._id) === String(productId));
        return prod ? prod.name : 'Unknown Product';
    };

    const filteredProducts = products.filter((product) => {
        const matchesSearch = productSearch
            ? product.name.toLowerCase().includes(productSearch.toLowerCase())
              || product.category?.toLowerCase().includes(productSearch.toLowerCase())
            : true;
        const matchesCategory = productCategory ? product.category === productCategory : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-pink-600">Skincare Routine Builder</h1>
                <p className="text-gray-600 mt-2">Create and manage structured morning/night routines with product steps.</p>
            </div>

            {error && <div className="mb-4 rounded-3xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
            {message && <div className="mb-4 rounded-3xl border border-green-200 bg-green-50 p-4 text-green-700">{message}</div>}

            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Build Routine</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Routine Type</label>
                            <select
                                value={routineType}
                                onChange={(e) => setRoutineType(e.target.value)}
                                className="w-full rounded-3xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-200"
                            >
                                <option value="morning">Morning</option>
                                <option value="night">Night</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                type="text"
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                placeholder="Search products by name/category"
                                className="rounded-3xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-200"
                            />
                            <select
                                value={productCategory}
                                onChange={(e) => setProductCategory(e.target.value)}
                                className="rounded-3xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-200"
                            >
                                <option value="">All Categories</option>
                                {productCategories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-4">
                            {STEP_NAMES.filter((step) => !(routineType === 'night' && step === 'Sunscreen')).map((stepName) => (
                                <div key={stepName}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{stepName}</label>
                                    <select
                                        value={selectedProducts[stepName] || ''}
                                        onChange={(e) => handleSelectProduct(stepName, e.target.value)}
                                        className="w-full rounded-3xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                    >
                                        <option value="">Select product</option>
                                        {filteredProducts.map((product) => (
                                            <option key={product._id} value={product._id}>
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={applyRecommendedRoutine}
                                className="w-full rounded-3xl border border-blue-300 bg-blue-50 px-6 py-3 text-blue-700 font-medium hover:bg-blue-100 transition"
                            >
                                Load Recommended Routine
                            </button>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 rounded-3xl bg-pink-600 px-6 py-3 text-white font-medium hover:bg-pink-700 transition"
                                >
                                    {selectedRoutineId ? 'Update Routine' : 'Save Routine'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 rounded-3xl border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Routines</h2>
                    {loading ? (
                        <p className="text-gray-500">Loading your routines...</p>
                    ) : routines.length === 0 ? (
                        <p className="text-gray-500">No routines yet. Add your first routine.</p>
                    ) : (
                        <div className="space-y-4">
                            {routines.map((routine) => (
                                <div key={routine._id} className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 capitalize">{routine.routine_type} Routine</h3>
                                            <p className="text-sm text-gray-500">{routine.isActive ? 'Active' : 'Paused'}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(routine)}
                                                className="rounded-full border border-pink-600 px-3 py-1 text-sm text-pink-600 hover:bg-pink-50 transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(routine)}
                                                className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 transition"
                                            >
                                                {routine.isActive ? 'Pause' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(routine._id)}
                                                className="rounded-full border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <ul className="space-y-2">
                                        {(routine.steps || []).map((step, index) => (
                                            <li key={index} className="flex justify-between rounded-xl bg-white px-4 py-2 border border-gray-200">
                                                <span>{step.step_name}</span>
                                                <span className="font-medium text-gray-700">
                                                    {step.product_id?.name || getProductName(step.product_id)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoutineTracker;

