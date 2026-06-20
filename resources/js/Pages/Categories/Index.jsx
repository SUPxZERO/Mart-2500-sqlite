import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import POSLayout from '@/Layouts/POSLayout';
import { Settings, Plus, Tags, Trash2, Edit2, X, AlertTriangle } from 'lucide-react';
// We use fallback alerts since react-hot-toast isn't installed

export default function CategoriesIndex({ categories }) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingCat, setEditingCat] = useState(null);
    const [deleteCat, setDeleteCat] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
    });

    const handleCreate = (e) => {
        e.preventDefault();
        post('/categories', {
            onSuccess: () => {
                setIsCreating(false);
                reset();
                alert('Category created successfully');
            },
            preserveScroll: true
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        put(`/categories/${editingCat.id}`, {
            onSuccess: () => {
                setEditingCat(null);
                reset();
                alert('Category updated successfully');
            },
            preserveScroll: true
        });
    };

    const handleDelete = () => {
        destroy(`/categories/${deleteCat.id}`, {
            onSuccess: () => {
                setDeleteCat(null);
                alert('Category deleted successfully');
            },
            onError: (err) => {
                alert(err.delete);
                setDeleteCat(null);
            },
            preserveScroll: true
        });
    };

    const openEdit = (cat) => {
        clearErrors();
        setEditingCat(cat);
        setData('name', cat.name);
    };

    const openCreate = () => {
        clearErrors();
        setIsCreating(true);
        setData('name', '');
    };

    const closeModals = () => {
        setIsCreating(false);
        setEditingCat(null);
        setDeleteCat(null);
        reset();
        clearErrors();
    };

    const hasOpenModal = isCreating || editingCat || deleteCat;

    return (
        <POSLayout
            title="Categories"
            description="Manage your product categories"
            backgroundImage="/images/backgrounds/bg_categories.png"
            icon={Tags}
            actions={
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Category
                </button>
            }
        >
            <Head title="Categories - Mart 2500" />

            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100/50 border-b border-slate-200/50 font-bold text-slate-600 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4 w-full">Name</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3 font-mono text-slate-500">{cat.id}</td>
                                    <td className="px-6 py-3 font-bold text-slate-700">{cat.name}</td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => openEdit(cat)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Edit Category"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => setDeleteCat(cat)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Delete Category"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Tags className="w-8 h-8 text-slate-300" />
                                            <p>No categories found.</p>
                                            <button onClick={openCreate} className="mt-2 text-indigo-600 font-bold hover:underline">
                                                Create your first category
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Overlay */}
            {hasOpenModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
                        
                        {/* Delete Confirmation */}
                        {deleteCat && (
                            <div className="p-6">
                                <div className="flex items-center gap-4 text-rose-600 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Delete Category</h3>
                                        <p className="text-sm text-slate-500 mt-1">Are you sure you want to delete "{deleteCat.name}"?</p>
                                    </div>
                                </div>
                                
                                <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-xl border border-amber-200 mb-6 flex gap-2 items-start">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p>You cannot delete this category if there are items currently using it. The items must be reassigned first.</p>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button onClick={closeModals} disabled={processing} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900">
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleDelete} 
                                        disabled={processing}
                                        className="px-5 py-2.5 text-sm font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Deleting...' : 'Delete Category'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Create / Edit Form */}
                        {(isCreating || editingCat) && (
                            <form onSubmit={isCreating ? handleCreate : handleEdit}>
                                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                    <h3 className="text-lg font-bold text-slate-900">
                                        {isCreating ? 'Create Category' : 'Edit Category'}
                                    </h3>
                                    <button type="button" onClick={closeModals} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Category Name *</label>
                                    <input 
                                        type="text" 
                                        value={data.name} 
                                        onChange={e => setData('name', e.target.value)}
                                        className="block w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 transition-colors"
                                        placeholder="e.g., Snacks, Drinks"
                                        required 
                                        autoFocus
                                    />
                                    {errors.name && <p className="text-rose-500 text-xs mt-1.5">{errors.name}</p>}

                                    {!isCreating && (
                                        <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-500 flex gap-2">
                                            <Tags className="w-4 h-4 shrink-0 text-slate-400" />
                                            <p>If you change the name, all items currently in this category will be automatically updated to the new name.</p>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 mt-8">
                                        <button type="button" onClick={closeModals} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900">
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={processing}
                                            className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 disabled:opacity-50"
                                        >
                                            {processing ? 'Saving...' : 'Save Category'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                    </div>
                </div>
            )}
        </POSLayout>
    );
}
