import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import POSLayout from '@/Layouts/POSLayout';
import { Package, Plus, Pencil, ToggleLeft, ToggleRight, Search, CheckCircle2, Tag } from 'lucide-react';

export default function ItemsIndex({ items, filters }) {
    const { flash } = usePage().props;
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [imageErrors, setImageErrors] = useState({});

    const formatMoney = (n) => new Intl.NumberFormat('en-US').format(n);

    const handleImageError = (itemId) => {
        setImageErrors(prev => ({ ...prev, [itemId]: true }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/items', { search: searchQuery }, { preserveState: true, preserveScroll: true });
    };

    const handleToggleActive = (item) => {
        if (item.is_active) {
            if (!confirm(`Deactivate "${item.name}"? It will be hidden from the POS.`)) return;
            router.delete(`/items/${item.id}`, { preserveScroll: true });
        } else {
            router.patch(`/items/${item.id}/restore`, {}, { preserveScroll: true });
        }
    };

    return (
        <POSLayout backgroundImage="/images/backgrounds/bg_items.png">
            <Head title="Item Management" />

            <div className="flex-1 flex flex-col h-full bg-white/40 backdrop-blur-md relative overflow-hidden rounded-2xl border border-slate-200/50 shadow-sm m-4">
                <div className="px-8 py-6 bg-white/60 border-b border-slate-200/60 shrink-0 shadow-sm z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 backdrop-blur-md">
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-amber-50 text-amber-500 rounded-lg">
                                <Package className="w-6 h-6" />
                            </div>
                            Item Management
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Add, edit, and manage your product catalog.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <form onSubmit={handleSearch} className="relative flex-1 md:w-80">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                data-page-search="true"
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="block w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-sm"
                                placeholder="Search name or category..."
                            />
                        </form>
                        <Link
                            href="/items/create"
                            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-sm transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Item</span>
                        </Link>
                    </div>
                </div>

                {flash?.success && (
                    <div className="mx-8 mt-4 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl shrink-0">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <p className="font-medium">{flash.success}</p>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Item</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4 text-right">Cost</th>
                                    <th className="px-6 py-4 text-right">Price</th>
                                    <th className="px-6 py-4 text-right">Margin</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.data.map(item => {
                                    const margin = item.default_cost > 0
                                        ? Math.round(((item.default_price - item.default_cost) / item.default_price) * 100)
                                        : null;

                                    return (
                                        <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${!item.is_active ? 'opacity-50' : ''}`}>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    {item.image_url && !imageErrors[item.id] ? (
                                                        <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0" onError={() => handleImageError(item.id)} />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0 text-lg">
                                                            📦
                                                        </div>
                                                    )}
                                                    <span className="font-semibold text-slate-800">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                                    <Tag className="w-3 h-3" /> {item.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right text-slate-500 font-mono text-xs">{formatMoney(item.default_cost)}</td>
                                            <td className="px-6 py-3 text-right text-emerald-600 font-mono font-bold text-sm">{formatMoney(item.default_price)}</td>
                                            <td className="px-6 py-3 text-right">
                                                {margin !== null && (
                                                    <span className={`text-xs font-bold ${margin >= 30 ? 'text-emerald-600' : margin >= 10 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                        {margin}%
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <button onClick={() => handleToggleActive(item)} title={item.is_active ? 'Deactivate' : 'Activate'}>
                                                    {item.is_active
                                                        ? <ToggleRight className="w-8 h-8 text-emerald-500 mx-auto hover:text-emerald-700 transition-colors" />
                                                        : <ToggleLeft className="w-8 h-8 text-slate-300 mx-auto hover:text-slate-500 transition-colors" />
                                                    }
                                                </button>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <Link
                                                    href={`/items/${item.id}/edit`}
                                                    className="inline-flex items-center justify-center p-2 text-indigo-500 hover:text-white hover:bg-indigo-500 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {items.data.length === 0 && (
                            <div className="p-12 text-center text-slate-500">
                                <Package className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                                <p className="text-lg font-medium">No items found.</p>
                                <p className="text-sm mt-1">
                                    <Link href="/items/create" className="text-emerald-600 font-bold hover:underline">Add your first item →</Link>
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex justify-end">
                        <p className="text-sm text-slate-500 font-mono">Showing {items.data.length} of {items.total} items</p>
                    </div>
                </div>
            </div>
        </POSLayout>
    );
}
