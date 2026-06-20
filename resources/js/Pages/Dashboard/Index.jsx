import { Head, router } from '@inertiajs/react';
import { t } from '@/i18n';
import POSLayout from '@/Layouts/POSLayout';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
    TrendingUp, ShoppingCart, Users, AlertTriangle,
    Banknote, Receipt, Package, DollarSign
} from 'lucide-react';

const CHART_COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#3B82F6'];

function StatCard({ icon, label, value, sub, color = 'slate' }) {
    const colorMap = {
        emerald: 'bg-emerald-50 text-emerald-600',
        indigo:  'bg-indigo-50 text-indigo-600',
        amber:   'bg-amber-50 text-amber-600',
        rose:    'bg-rose-50 text-rose-600',
        slate:   'bg-slate-100 text-slate-500',
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${colorMap[color]}`}>
                    {icon}
                </div>
            </div>
            <p className="text-3xl font-black text-slate-800 tracking-tight truncate">{value}</p>
            <p className="text-sm font-semibold text-slate-500 mt-1">{label}</p>
            {sub && <p className="text-xs text-slate-400 mt-2">{sub}</p>}
        </div>
    );
}

const formatMoney = (n) => new Intl.NumberFormat('en-US').format(n);

export default function DashboardIndex({
    range = 'today', stats, revenueTrend, topItems, paymentBreakdown, totalDebt, customersInDebt
}) {
    const handleRangeChange = (newRange) => {
        router.get('/dashboard', { range: newRange }, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <POSLayout
            title={t('dashboard.title')}
            description={t('dashboard.description')}
            icon={TrendingUp}
            contentClassName="space-y-8"
            contentWidth="wide"
        >
            <Head title={t('dashboard.page_title')} />

            <section className="shrink-0">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {range === 'today' ? "Today's Performance" : range === 'month' ? "This Month's Performance" : "This Year's Performance"}
                    </h2>
                    <div className="flex bg-slate-100 rounded-xl p-1">
                        <button 
                            onClick={() => handleRangeChange('today')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${range === 'today' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Today
                        </button>
                        <button 
                            onClick={() => handleRangeChange('month')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${range === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            This Month
                        </button>
                        <button 
                            onClick={() => handleRangeChange('year')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${range === 'year' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            This Year
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <StatCard 
                        icon={<Banknote className="w-6 h-6" />} 
                        label={t('dashboard.revenue_completed')} 
                        value={`${formatMoney(stats.revenue_khr)}`} 
                        sub="KHR"
                        color="emerald"
                    />
                    <StatCard 
                        icon={<DollarSign className="w-6 h-6" />} 
                        label="Gross Profit" 
                        value={`${formatMoney(stats.profit_khr)}`} 
                        sub="KHR"
                        color="indigo"
                    />
                    <StatCard 
                        icon={<Receipt className="w-6 h-6" />} 
                        label={t('dashboard.transactions')} 
                        value={stats.transactions} 
                        color="slate"
                    />
                    <StatCard 
                        icon={<ShoppingCart className="w-6 h-6" />} 
                        label={t('dashboard.debt_added_today')} 
                        value={`${formatMoney(stats.debt_added)}`} 
                        sub="KHR"
                        color="amber"
                    />
                    <StatCard 
                        icon={<Users className="w-6 h-6" />} 
                        label={t('dashboard.payments_collected')} 
                        value={`${formatMoney(stats.payments_collected)}`} 
                        sub="KHR"
                        color="emerald"
                    />
                </div>
            </section>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 shrink-0">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
                    <h3 className="mb-1 font-bold text-slate-700">{t('dashboard.revenue_trend')}</h3>
                    <p className="mb-4 text-xs text-slate-400">{t('dashboard.revenue_trend_description')}</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={revenueTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip 
                                cursor={{ fill: '#F1F5F9' }}
                                contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                formatter={(v) => [`${formatMoney(v)} KHR`, t('dashboard.revenue')]}
                            />
                            <Bar dataKey="total" fill="#10B981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-1 font-bold text-slate-700">{t('dashboard.payment_methods')}</h3>
                    <p className="mb-4 text-xs text-slate-400">{t('dashboard.payment_methods_description')}</p>
                    {paymentBreakdown.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie 
                                    data={paymentBreakdown} 
                                    cx="50%" cy="50%" 
                                    innerRadius={60} outerRadius={90} 
                                    paddingAngle={4} 
                                    dataKey="value"
                                >
                                    {paymentBreakdown.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} 
                                    formatter={(v) => [`${formatMoney(v)} KHR`, 'Volume']}
                                />                                        
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-[220px] items-center justify-center font-medium text-slate-300">{t('dashboard.no_data_yet')}</div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 shrink-0">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-1 flex items-center gap-2 font-bold text-slate-700">
                        <Package className="w-4 h-4 text-indigo-400" />
                        {t('dashboard.top_items')}
                    </h3>
                    <p className="mb-4 text-xs text-slate-400">{t('dashboard.top_items_description')}</p>
                    {topItems.length > 0 ? (
                        <ul className="space-y-3">
                            {topItems.map((item, i) => (
                                <li key={i} className="flex items-center justify-between">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div
                                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                            style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                                        >
                                            {i + 1}
                                        </div>
                                        <span className="truncate font-medium text-slate-700">{item.item_name}</span>
                                    </div>
                                    <div className="shrink-0 pl-4 text-right">
                                        <p className="text-sm font-bold text-slate-700">{formatMoney(item.total_revenue)} KHR</p>
                                        <p className="text-xs text-slate-400">{t('dashboard.sold_count', { count: item.total_qty })}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="py-8 text-center font-medium text-slate-300">{t('dashboard.no_sales_data_yet')}</p>
                    )}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-1 flex items-center gap-2 font-bold text-slate-700">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        {t('dashboard.debt_summary')}
                    </h3>
                    <p className="mb-6 text-xs text-slate-400">{t('dashboard.debt_summary_description')}</p>
                    
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50 p-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-rose-400">{t('dashboard.total_owed')}</p>
                                <p className="mt-1 text-3xl font-black text-rose-600">{formatMoney(totalDebt)} <span className="text-base font-bold">KHR</span></p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('dashboard.customers_in_debt')}</p>
                                <p className="mt-1 text-3xl font-black text-slate-700">{customersInDebt}</p>
                            </div>
                            <div className="text-slate-300">
                                <Users className="w-10 h-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </POSLayout>
    );
}
