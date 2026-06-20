import { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import POSLayout from '@/Layouts/POSLayout';
import { Package, ArrowLeft, Upload, X, ImageIcon, Plus, Check, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function ItemsForm({ item, categories: initialCategories }) {
    const isEditing = item !== null;
    const [imagePreview, setImagePreview] = useState(item?.image_url || null);
    const fileRef = useRef(null);

    // Dynamic categories — fetched from DB, can add new inline
    const [categories, setCategories] = useState(initialCategories || []);
    const [showNewCat, setShowNewCat] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatLoading, setNewCatLoading] = useState(false);
    const [newCatError, setNewCatError] = useState('');
    const newCatInputRef = useRef(null);

    useEffect(() => {
        if (showNewCat) newCatInputRef.current?.focus();
    }, [showNewCat]);

    const handleAddCategory = async () => {
        const name = newCatName.trim();
        if (!name) return;
        setNewCatLoading(true);
        setNewCatError('');
        try {
            await axios.post('/api/categories', { name });
            setCategories(prev => [...prev, name]);
            setData('category', name);
            setNewCatName('');
            setShowNewCat(false);
        } catch (err) {
            setNewCatError(err.response?.data?.errors?.name?.[0] || err.response?.data?.message || 'Failed to create category.');
        } finally {
            setNewCatLoading(false);
        }
    };

    const { data, setData, post, processing, errors, progress } = useForm({
        name:          item?.name || '',
        default_cost:  item?.default_cost || '',
        default_price: item?.default_price || '',
        category:      item?.category || 'General',
        is_active:     item?.is_active ?? true,
        image:         null,
        _method:       isEditing ? 'PUT' : 'POST',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const url = isEditing ? `/items/${item.id}` : '/items';
        post(url, {
            forceFormData: true,
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setData('image', file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const clearImage = () => {
        setData('image', null);
        setImagePreview(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    return (
        <POSLayout>
            <Head title={isEditing ? `Edit: ${item.name}` : 'Add New Item'} />

            <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
                <div className="px-8 py-6 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
                    <Link href="/items" className="inline-flex items-center text-sm font-bold text-indigo-500 hover:text-indigo-600 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Items
                    </Link>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                            <Package className="w-6 h-6" />
                        </div>
                        {isEditing ? `Edit: ${item.name}` : 'Add New Item'}
                    </h1>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <form onSubmit={handleSubmit} encType="multipart/form-data" className="max-w-2xl space-y-6">

                        {/* Image Upload */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-amber-400" />
                                Product Image
                            </h2>

                            <div className="flex items-start gap-6">
                                <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 relative">
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <button type="button" onClick={clearImage}
                                                className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </>
                                    ) : (
                                        <Package className="w-10 h-10 text-slate-300" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <button type="button" onClick={() => fileRef.current?.click()}
                                        className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-sm font-semibold text-slate-600">
                                        <Upload className="w-4 h-4" />
                                        {imagePreview ? 'Replace Image' : 'Upload Image'}
                                    </button>
                                    <input ref={fileRef} type="file" accept="image/jpg,image/jpeg,image/png,image/webp"
                                        onChange={handleImageChange} className="hidden" />
                                    <p className="text-xs text-slate-400 mt-2">JPG, PNG, or WEBP · Max 2MB</p>
                                    {errors.image && <p className="text-rose-500 text-xs mt-1">{errors.image}</p>}
                                    {progress && <p className="text-indigo-500 text-xs mt-1">Uploading... {progress.percentage}%</p>}
                                </div>
                            </div>
                        </div>

                        {/* Basic Details */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                            <h2 className="font-bold text-slate-700">Item Details</h2>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Item Name *</label>
                                <input type="text" value={data.name} onChange={e => setData('name', e.target.value)} required
                                    className="block w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
                                    placeholder="e.g. Coca Cola 330ml" />
                                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Category *</label>
                                <div className="flex gap-2">
                                    <select
                                        value={data.category}
                                        onChange={e => setData('category', e.target.value)}
                                        className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white transition-colors"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => { setShowNewCat(v => !v); setNewCatName(''); setNewCatError(''); }}
                                        className="shrink-0 px-3 py-2.5 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1 text-sm font-semibold"
                                        title="Add a new category"
                                    >
                                        <Plus className="w-4 h-4" />
                                        New
                                    </button>
                                </div>

                                {/* Inline new category input */}
                                {showNewCat && (
                                    <div className="mt-2 flex gap-2 items-center">
                                        <input
                                            ref={newCatInputRef}
                                            type="text"
                                            value={newCatName}
                                            onChange={e => { setNewCatName(e.target.value); setNewCatError(''); }}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); }
                                                if (e.key === 'Escape') setShowNewCat(false);
                                            }}
                                            placeholder="e.g. Frozen Foods"
                                            className="flex-1 px-3 py-2 border-2 border-indigo-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCategory}
                                            disabled={newCatLoading || !newCatName.trim()}
                                            className="shrink-0 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 text-white rounded-xl flex items-center gap-1 text-sm font-bold transition-colors"
                                        >
                                            {newCatLoading
                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                : <Check className="w-4 h-4" />
                                            }
                                            Add
                                        </button>
                                        <button type="button" onClick={() => setShowNewCat(false)} className="p-2 text-slate-400 hover:text-slate-600">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                {newCatError && <p className="text-rose-500 text-xs mt-1">{newCatError}</p>}
                                {errors.category && <p className="text-rose-500 text-xs mt-1">{errors.category}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Cost Price (KHR) *</label>
                                    <div className="relative">
                                        <input type="number" min="0" value={data.default_cost} onChange={e => setData('default_cost', parseInt(e.target.value) || 0)} required
                                            className="block w-full pl-4 pr-14 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors" />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <span className="text-slate-400 text-sm font-bold">KHR</span>
                                        </div>
                                    </div>
                                    {errors.default_cost && <p className="text-rose-500 text-xs mt-1">{errors.default_cost}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Selling Price (KHR) *</label>
                                    <div className="relative">
                                        <input type="number" min="1" value={data.default_price} onChange={e => setData('default_price', parseInt(e.target.value) || 0)} required
                                            className="block w-full pl-4 pr-14 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors" />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <span className="text-slate-400 text-sm font-bold">KHR</span>
                                        </div>
                                    </div>
                                    {errors.default_price && <p className="text-rose-500 text-xs mt-1">{errors.default_price}</p>}
                                </div>
                            </div>

                            {/* Margin preview */}
                            {data.default_cost > 0 && data.default_price > 0 && (
                                <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Profit Margin</span>
                                    <span className={`font-bold ${((data.default_price - data.default_cost) / data.default_price * 100) >= 20 ? 'text-emerald-600' : 'text-amber-500'}`}>
                                        {Math.round((data.default_price - data.default_cost) / data.default_price * 100)}% 
                                        &nbsp;({new Intl.NumberFormat().format(data.default_price - data.default_cost)} KHR)
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-2">
                                <div>
                                    <p className="font-bold text-slate-700 text-sm">Active in POS</p>
                                    <p className="text-xs text-slate-400">Inactive items are hidden from the checkout grid</p>
                                </div>
                                <button type="button" onClick={() => setData('is_active', !data.is_active)}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${data.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${data.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button type="submit" disabled={processing}
                                className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2">
                                {processing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                {isEditing ? 'Save Changes' : 'Create Item'}
                            </button>
                            <Link href="/items" className="px-6 py-3.5 border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </POSLayout>
    );
}
