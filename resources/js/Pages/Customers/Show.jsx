import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { t } from '@/i18n';
import POSLayout from '@/Layouts/POSLayout';
import { Phone, ArrowLeft, ArrowDownLeft, HandCoins, Receipt, Users, TrendingUp, Calendar, CalendarDays, BarChart2, ShoppingBag } from 'lucide-react';
import ReceivePaymentModal from '@/Components/Customers/ReceivePaymentModal';

export default function CustomerShow({ customer, timeline, spending, exchangeRate }) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const fmt = (amount) => new Intl.NumberFormat('en-US').format(amount);
    const formatMoney = (amount) => new Intl.NumberFormat('en-US').format(amount);
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <POSLayout
            title={customer.name}
            description={customer.phone_number || t('customers.no_phone_number')}
            icon={Users}
            contentWidth="wide"
            contentClassName="space-y-6 pb-12 !block !h-auto"
            header={
                <div className="flex flex-col gap-4">
                    <Link href="/customers" className="inline-flex items-center text-sm font-bold text-indigo-500 transition-colors hover:text-indigo-600">
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        {t('customers.back_to_customers')}
                    </Link>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-100 text-2xl font-black text-slate-500">
                                {customer.name.charAt(0)}
                            </div>
                            <div className="text-slate-500">
                                <div className="flex items-center gap-2 font-medium">
                                    <Phone className="h-4 w-4" />
                                    {customer.phone_number || t('customers.no_phone_number')}
                                </div>
                            </div>
                        </div>

                        <div className="grid w-full gap-4 sm:grid-cols-2 lg:w-auto">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-right shadow-sm">
                                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">{t('customers.lifetime_spent')}</p>
                                <p className="text-xl font-bold text-slate-700">{formatMoney(customer.total_lifetime_spent)} <span className="text-xs">KHR</span></p>
                            </div>
                            <div className={`rounded-2xl border p-4 text-right shadow-sm ${customer.total_debt_balance > 0 ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}>
                                <p className={`mb-1 text-xs font-bold uppercase tracking-wider ${customer.total_debt_balance > 0 ? 'text-rose-400' : 'text-emerald-500'}`}>
                                    {customer.total_debt_balance > 0 ? t('customers.currently_owes') : t('customers.store_credit')}
                                </p>
                                <p className={`text-2xl font-black ${customer.total_debt_balance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                                    {formatMoney(Math.abs(customer.total_debt_balance))} <span className="text-xs">KHR</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={t('customers.detail_page_title', { name: customer.name })} />

            {/* ── Spending Analytics Section ───────────────────────────── */}
            <section>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Spending Breakdown</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                            <CalendarDays className="h-3.5 w-3.5" /> This Week
                        </div>
                        <p className="text-lg font-black text-slate-800">{fmt(spending.this_week)}</p>
                        <p className="text-xs text-slate-400">KHR</p>
                    </div>
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 shadow-sm">
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                            <Calendar className="h-3.5 w-3.5" /> This Month
                        </div>
                        <p className="text-lg font-black text-indigo-800">{fmt(spending.this_month)}</p>
                        <p className="text-xs text-indigo-400">KHR</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-500">
                            <BarChart2 className="h-3.5 w-3.5" /> This Year
                        </div>
                        <p className="text-lg font-black text-emerald-800">{fmt(spending.this_year)}</p>
                        <p className="text-xs text-emerald-500">KHR</p>
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
                        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
                            <TrendingUp className="h-3.5 w-3.5" /> Lifetime
                        </div>
                        <p className="text-lg font-black text-amber-800">{fmt(spending.lifetime)}</p>
                        <p className="text-xs text-amber-500">KHR</p>
                    </div>
                </div>
            </section>

            {/* ── Order Stats Row ──────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
                    <p className="text-2xl font-black text-slate-800">{spending.total_orders}</p>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Completed Orders</p>
                </div>
                <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 shadow-sm text-center">
                    <p className="text-2xl font-black text-rose-700">{spending.debt_orders}</p>
                    <p className="text-xs font-semibold text-rose-400 mt-1">Debt Orders</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
                    <p className="text-2xl font-black text-slate-800">{fmt(spending.avg_order)}</p>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Avg Order <span className="text-slate-300">KHR</span></p>
                </div>
            </div>

            {/* ── Transaction Timeline ─────────────────────────────────── */}
            <div className="flex items-end justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-800">{t('customers.transaction_timeline')}</h2>
                {customer.total_debt_balance > 0 && (
                    <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95"
                    >
                        <HandCoins className="h-5 w-5" />
                        {t('customers.receive_debt_payment')}
                    </button>
                )}
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="absolute bottom-0 left-12 top-0 z-0 hidden w-0.5 bg-slate-100 md:block"></div>
                
                <ul className="relative z-10 divide-y divide-slate-100">
                    {timeline.length === 0 ? (
                        <li className="p-12 text-center text-slate-500">{t('customers.no_transactions')}</li>
                    ) : (
                        timeline.map((item) => (
                            <li key={item.id} className="flex flex-col gap-6 p-6 transition-colors hover:bg-slate-50 md:flex-row">
                                <div className="shrink-0 pt-1 font-mono text-sm text-slate-400 md:w-32">
                                    {formatDate(item.date)}
                                </div>
                                
                                <div className="flex flex-1 items-start gap-4">
                                    {item.type === 'invoice' ? (
                                        <div className="mt-1 shrink-0 rounded-full border border-rose-200 bg-rose-100 p-3 text-rose-500 shadow-sm">
                                            <Receipt className="h-6 w-6" />
                                        </div>
                                    ) : (
                                        <div className="mt-1 shrink-0 rounded-full border border-emerald-200 bg-emerald-100 p-3 text-emerald-600 shadow-sm">
                                            <ArrowDownLeft className="h-6 w-6" />
                                        </div>
                                    )}

                                    <div className="flex-1 pt-1 text-left">
                                        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-800">
                                                    {item.type === 'invoice' ? (
                                                        <>{t('customers.purchase')} <span className="ml-2 font-mono text-sm font-normal text-slate-400">{item.invoice_number}</span></>
                                                    ) : (
                                                        <>{t('customers.payment_received')} <span className="ml-2 text-sm font-normal text-slate-400">{t('customers.via_method', { method: item.method })}</span></>
                                                    )}
                                                </h4>
                                                {item.status === 'Added_To_Debt' && (
                                                    <span className="mt-1 inline-block rounded bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600">{t('customers.added_to_debt')}</span>
                                                )}
                                            </div>
                                            
                                            <div className="text-right">
                                                <span className={`text-xl font-bold ${item.type === 'invoice' && item.status === 'Added_To_Debt' ? 'text-rose-600' : 'text-slate-700'}`}>
                                                    {item.type === 'invoice' && item.status === 'Added_To_Debt' ? '+' : ''}
                                                    {item.type === 'payment' ? '-' : ''}
                                                    {formatMoney(item.amount)} KHR
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            <ReceivePaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                customer={customer}
                exchangeRate={exchangeRate}
            />
        </POSLayout>
    );
}


