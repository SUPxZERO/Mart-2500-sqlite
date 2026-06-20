import { useState, useEffect } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { t } from '@/i18n';
import POSLayout from '@/Layouts/POSLayout';
import { Users, Search, Phone, ChevronRight, Plus, Loader2, X, CheckCircle } from 'lucide-react';
import Modal from '@/Components/Modal';

export default function CustomersIndex({ customers, filters }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        phone_number: '',
    });

    // Show flash success message for 3 seconds
    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    const formatMoney = (amount) => new Intl.NumberFormat('en-US').format(amount);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/customers', { search: searchQuery }, { preserveState: true, preserveScroll: true });
    };

    const handleCreateCustomer = (e) => {
        e.preventDefault();
        post('/customers', {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
                setSearchQuery('');
            },
        });
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        reset();
        clearErrors();
    };

    return (
        <POSLayout
            title={t('customers.title')}
            description={t('customers.description')}
            icon={Users}
            contentWidth="wide"
            header={
                <div className="flex w-full max-w-2xl items-center gap-4">
                    <form onSubmit={handleSearch} className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            data-page-search="true"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 transition-colors focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200"
                            placeholder={t('customers.search_placeholder')}
                        />
                    </form>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="hidden sm:inline">Add Customer</span>
                    </button>
                </div>
            }
        >
            <Head title={t('customers.page_title')} />

            {/* Success toast */}
            {successMessage && (
                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                    <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                    {successMessage}
                </div>
            )}

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-6 py-4">{t('customers.table_customer')}</th>
                                <th className="px-6 py-4">{t('customers.table_contact')}</th>
                                <th className="px-6 py-4 text-right">{t('customers.table_lifetime_value')}</th>
                                <th className="px-6 py-4 text-right">{t('customers.table_debt_balance')}</th>
                                <th className="px-6 py-4 text-center">{t('customers.table_action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {customers.data.map((customer) => (
                                <tr key={customer.id} className="group transition-colors hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500">
                                                {customer.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-slate-700">{customer.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {customer.phone_number ? (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3 w-3" />
                                                {customer.phone_number}
                                            </div>
                                        ) : (
                                            <span className="italic text-slate-300">{t('pos.no_phone')}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-slate-600">
                                        {formatMoney(customer.total_lifetime_spent)} <span className="text-xs text-slate-400">KHR</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {customer.total_debt_balance > 0 ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
                                                Owes {formatMoney(customer.total_debt_balance)} KHR
                                            </span>
                                        ) : customer.total_debt_balance < 0 ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                                Credit {formatMoney(Math.abs(customer.total_debt_balance))} KHR
                                            </span>
                                        ) : (
                                            <span className="font-medium text-slate-400">{t('customers.settled')}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Link 
                                            href={`/customers/${customer.id}`}
                                            className="inline-flex items-center justify-center rounded-lg p-2 text-indigo-500 transition-colors group-hover:shadow-sm hover:bg-indigo-500 hover:text-white"
                                            title="View Profile"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="divide-y divide-slate-100 md:hidden">
                    {customers.data.map((customer) => (
                        <Link
                            key={customer.id}
                            href={`/customers/${customer.id}`}
                            className="block p-5 transition-colors hover:bg-slate-50"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500">
                                            {customer.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate font-bold text-slate-800">{customer.name}</p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {customer.phone_number || t('pos.no_phone')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-300" />
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-xs uppercase tracking-wider text-slate-400">Lifetime</p>
                                    <p className="mt-1 font-bold text-slate-700">{formatMoney(customer.total_lifetime_spent)} KHR</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-xs uppercase tracking-wider text-slate-400">Balance</p>
                                    <p className="mt-1 font-bold text-slate-700">
                                        {customer.total_debt_balance > 0
                                            ? `${formatMoney(customer.total_debt_balance)} owed`
                                            : customer.total_debt_balance < 0
                                              ? `${formatMoney(Math.abs(customer.total_debt_balance))} credit`
                                              : t('customers.settled')}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                
                {customers.data.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        <Users className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                        <p className="text-lg font-medium">{t('customers.no_customers_found')}</p>
                    </div>
                )}
            </div>

            {/* Create Customer Modal */}
            <Modal show={isCreateModalOpen} onClose={closeCreateModal} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-slate-800">Add New Customer</h2>
                        <button onClick={closeCreateModal} className="text-slate-400 hover:text-slate-600">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleCreateCustomer} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                Customer Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                autoFocus
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className={`block w-full rounded-xl border ${errors.name ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'} bg-white px-4 py-2.5 transition-colors focus:ring-2`}
                                placeholder="E.g. Sokha"
                            />
                            {errors.name && <p className="mt-1.5 text-sm text-rose-500">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                                Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={data.phone_number}
                                onChange={e => setData('phone_number', e.target.value)}
                                className={`block w-full rounded-xl border ${errors.phone_number ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200' : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-200'} bg-white px-4 py-2.5 transition-colors focus:ring-2`}
                                placeholder="E.g. 012 345 678"
                            />
                            {errors.phone_number && <p className="mt-1.5 text-sm text-rose-500">{errors.phone_number}</p>}
                        </div>

                        <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={closeCreateModal}
                                disabled={processing}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 font-bold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Customer'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </POSLayout>
    );
}
