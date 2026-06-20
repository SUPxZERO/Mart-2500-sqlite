import { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { t } from '@/i18n';
import POSLayout from '@/Layouts/POSLayout';
import { FileText, Eye, User, Calendar, DollarSign, CheckCircle2, Download, Filter } from 'lucide-react';
import InvoiceDetailModal from '@/Components/Invoices/InvoiceDetailModal';

export default function InvoicesIndex({ invoices, filters }) {
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [period, setPeriod] = useState(filters?.period || 'month');
    const [from, setFrom] = useState(filters?.from || '');
    const [to, setTo] = useState(filters?.to || '');

    const formatMoney = (amount) => new Intl.NumberFormat('en-US').format(amount);
    const activeFilterParams = useMemo(() => {
        const params = { period };

        if (period === 'range') {
            if (from) params.from = from;
            if (to) params.to = to;
        }

        return params;
    }, [period, from, to]);
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getPaymentLabel = (invoice) =>
        (invoice.payment_provider || invoice.payment_method || '').replace('_', ' ');

    const getPeriodLabel = (period, from, to) => {
        switch (period) {
            case 'week': return 'This Week';
            case 'month': return 'This Month';
            case 'year': return 'This Year';
            case 'range': return from && to ? `(${from} → ${to})` : 'Range';
            default: return 'All';
        }
    };

    const getStatusBadge = (status, paymentLabel) => {
        if (status === 'Completed') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('invoices.paid_method', { method: paymentLabel })}
                </span>
            );
        }
        if (status === 'Added_To_Debt') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                    <DollarSign className="w-3 h-3" />
                    {t('invoices.store_credit')}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {status}
            </span>
        );
    };

    const applyFilters = () => {
        router.get('/invoices', activeFilterParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePresetChange = (nextPeriod) => {
        setPeriod(nextPeriod);

        const nextParams = { period: nextPeriod };

        if (nextPeriod === 'range') {
            if (from) nextParams.from = from;
            if (to) nextParams.to = to;
        }

        router.get('/invoices', nextParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const exportHref = useMemo(() => {
        const params = new URLSearchParams(activeFilterParams);
        return `/invoices/export?${params.toString()}`;
    }, [activeFilterParams]);

    return (
        <POSLayout
            title={t('invoices.title')}
            description={t('invoices.description')}
            backgroundImage="/images/backgrounds/bg_invoices.png"
            icon={FileText}
            contentClassName="space-y-4"
            header={
                <div className="flex w-full flex-col gap-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { value: 'week', label: 'This Week' },
                                    { value: 'month', label: 'This Month' },
                                    { value: 'year', label: 'This Year' },
                                    { value: 'range', label: 'Date Range' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handlePresetChange(option.value)}
                                        className={`rounded-2xl border px-4 py-2 text-sm font-bold transition-colors ${
                                            period === option.value
                                                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                                                : 'border-white/50 bg-white/60 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            {period === 'range' && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 rounded-2xl border border-white/50 bg-white/60 px-3 py-1.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <input
                                            type="date"
                                            value={from}
                                            onChange={(e) => setFrom(e.target.value)}
                                            className="border-none bg-transparent p-0 text-sm focus:ring-0"
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-slate-400">to</span>
                                    <div className="flex items-center gap-2 rounded-2xl border border-white/50 bg-white/60 px-3 py-1.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <input
                                            type="date"
                                            value={to}
                                            onChange={(e) => setTo(e.target.value)}
                                            className="border-none bg-transparent p-0 text-sm focus:ring-0"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={applyFilters}
                                        disabled={!from || !to}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                                    >
                                        <Filter className="h-4 w-4" />
                                        Apply Range
                                    </button>
                                </div>
                            )}
                        </div>

                        <a
                            href={exportHref}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95 sm:w-auto"
                            title={`Export ${getPeriodLabel(period, from, to)} invoices to Excel`}
                        >
                            <Download className="h-5 w-5" />
                            Export {getPeriodLabel(period, from, to)}
                        </a>
                    </div>
                </div>
            }
        >
            <Head title={t('invoices.page_title')} />

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                            <tr>
                                <th className="px-6 py-4">{t('invoices.invoice_number')}</th>
                                <th className="px-6 py-4">{t('invoices.date')}</th>
                                <th className="px-6 py-4">{t('invoices.customer')}</th>
                                <th className="px-6 py-4 text-right">{t('invoices.total_khr')}</th>
                                <th className="px-6 py-4">{t('invoices.status_method')}</th>
                                <th className="px-6 py-4 text-center">{t('invoices.action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {invoices.data.map((invoice) => (
                                <tr key={invoice.id} className="group transition-colors hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono font-medium text-indigo-600">
                                        {invoice.invoice_number}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            {formatDate(invoice.created_at)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {invoice.customer ? (
                                            <div className="flex items-center gap-2 font-medium text-slate-700">
                                                <User className="h-4 w-4 text-slate-400" />
                                                {invoice.customer.name}
                                            </div>
                                        ) : (
                                            <span className="italic text-slate-400">{t('invoices.walk_in_customer')}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-700">
                                        {formatMoney(invoice.total_khr)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(invoice.status, getPaymentLabel(invoice))}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => setSelectedInvoice(invoice)}
                                                className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition-colors tooltip hover:bg-indigo-50 hover:text-indigo-600"
                                                title={t('actions.view_receipt')}
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                            <a
                                                href={`/invoices/${invoice.id}/show`}
                                                className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                                                title="Open invoice for PDF download"
                                            >
                                                <Download className="h-5 w-5" />
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="divide-y divide-slate-100 md:hidden">
                    {invoices.data.map((invoice) => (
                        <div
                            key={invoice.id}
                            className="p-5 transition-colors hover:bg-slate-50"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedInvoice(invoice)}
                                    className="min-w-0 flex-1 text-left"
                                >
                                    <p className="font-mono text-sm font-semibold text-indigo-600">
                                        {invoice.invoice_number}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {formatDate(invoice.created_at)}
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedInvoice(invoice)}
                                    className="shrink-0"
                                >
                                    <Eye className="mt-1 h-5 w-5 text-slate-300" />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedInvoice(invoice)}
                                className="mt-4 block w-full text-left"
                            >
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-xs uppercase tracking-wider text-slate-400">{t('invoices.customer')}</p>
                                    <p className="mt-1 font-medium text-slate-700">
                                        {invoice.customer?.name || t('invoices.walk_in_customer')}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-3">
                                    <p className="text-xs uppercase tracking-wider text-slate-400">{t('pos.total')}</p>
                                    <p className="mt-1 font-bold text-slate-700">
                                        {formatMoney(invoice.total_khr)} KHR
                                    </p>
                                </div>
                                </div>

                                <div className="mt-3">
                                    {getStatusBadge(invoice.status, getPaymentLabel(invoice))}
                                </div>
                            </button>

                            <div className="mt-3 flex justify-end">
                                <a
                                    href={`/invoices/${invoice.id}/show`}
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
                                >
                                    <Download className="h-4 w-4" />
                                    PDF
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
                
                {invoices.data.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        <FileText className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                        <p className="text-lg font-medium">{t('invoices.no_invoices_found')}</p>
                        <p className="text-sm">{t('invoices.no_invoices_hint')}</p>
                    </div>
                )}
            </div>
            
            <div className="flex justify-end">
                <p className="font-mono text-sm text-slate-500">{t('invoices.showing_invoices', { count: invoices.data.length, total: invoices.total })}</p>
            </div>

            <InvoiceDetailModal 
                isOpen={selectedInvoice !== null}
                onClose={() => setSelectedInvoice(null)}
                invoiceId={selectedInvoice?.id}
            />
        </POSLayout>
    );
}
