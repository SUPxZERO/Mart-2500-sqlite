import POSLayout from '@/Layouts/POSLayout';
import { Head, router } from '@inertiajs/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, AlertCircle, Users } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard({ stats, revenueTrend, topItems, paymentBreakdown, totalDebt, customersInDebt, range = 'today' }) {
    const formatMoney = (n) => new Intl.NumberFormat('en-US').format(n);

    const handleRangeChange = (newRange) => {
        router.get('/dashboard', { range: newRange }, { preserveState: true });
    };

    const StatCard = ({ icon: Icon, label, value, currency = true, color = 'emerald' }) => (
        <div className={`bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 p-6`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm text-${color}-700 font-bold`}>{label}</p>
                    <p className={`text-2xl font-bold text-slate-800 mt-2`}>
                        {currency ? formatMoney(value) : value.toLocaleString()}
                        {currency && <span className="text-sm ml-1">KHR</span>}
                    </p>
                </div>
                <Icon className={`w-8 h-8 text-${color}-600`} />
            </div>
        </div>
    );

    return (
        <POSLayout backgroundImage="/images/backgrounds/bg_dashboard.png">
            <Head title="Dashboard & Reporting" />

            <div className="p-2 sm:p-4 lg:p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-sm">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard & Reporting</h1>
                        <p className="text-gray-700 mt-1 font-medium">Live overview of store performance, revenue, top items, and debt exposure.</p>
                    </div>
                </div>

                    {/* Range Filter */}
                    <div className="flex gap-2">
                        {['today', 'month', 'year'].map(r => (
                            <button
                                key={r}
                                onClick={() => handleRangeChange(r)}
                                className={`px-4 py-2 rounded-lg font-medium transition ${
                                    range === r
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:border-emerald-400'
                                }`}
                            >
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Performance Stats */}
                    <div>
                        <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">THIS {range === 'year' ? 'YEAR' : range === 'month' ? 'MONTH' : 'DAY'}'S PERFORMANCE</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <StatCard icon={DollarSign} label="Revenue (Completed)" value={stats.revenue_khr} color="emerald" />
                            <StatCard icon={TrendingUp} label="Gross Profit" value={stats.profit_khr} color="blue" />
                            <StatCard icon={ShoppingCart} label="Transactions" value={stats.transactions} currency={false} color="amber" />
                            <StatCard icon={AlertCircle} label="Debt Added Today" value={stats.debt_added} color="red" />
                            <StatCard icon={Users} label="Payments Collected" value={stats.payments_collected} color="purple" />
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Revenue Trend */}
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {range === 'today' ? '7-Day Revenue Trend' : range === 'month' ? 'Weekly Revenue' : 'Monthly Revenue'}
                            </h3>
                            {revenueTrend && revenueTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={revenueTrend}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="date" stroke="#6b7280" />
                                        <YAxis stroke="#6b7280" />
                                        <Tooltip formatter={(v) => formatMoney(v)} />
                                        <Line
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            dot={{ fill: '#10b981', r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-75 flex items-center justify-center text-gray-400">No sales data yet</div>
                            )}
                        </div>

                        {/* Payment Methods */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                            {paymentBreakdown && paymentBreakdown.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={paymentBreakdown}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                        >
                                            {paymentBreakdown.map((_, idx) => (
                                                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(v) => formatMoney(v)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-75 flex items-center justify-center text-gray-400">No data yet</div>
                            )}
                            {paymentBreakdown && paymentBreakdown.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {paymentBreakdown.map((pm, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                                {pm.name}
                                            </span>
                                            <span className="font-semibold">{formatMoney(pm.value)} KHR</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Items */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Items by Revenue</h3>
                            {topItems && topItems.length > 0 ? (
                                <div className="space-y-3">
                                    {topItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{item.item_name}</p>
                                                <p className="text-sm text-gray-600">{item.total_qty} units sold</p>
                                            </div>
                                            <p className="font-semibold text-emerald-600">{formatMoney(item.total_revenue)} KHR</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-48 flex items-center justify-center text-gray-400">No sales data yet</div>
                            )}
                        </div>

                        {/* Outstanding Debt */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Outstanding Debt Summary</h3>
                            <div className="space-y-4">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-xs text-red-600 font-semibold uppercase">Total Owed</p>
                                    <p className="text-3xl font-bold text-red-700 mt-1">{formatMoney(totalDebt)} KHR</p>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm text-gray-600">Customers in Debt</p>
                                        <p className="text-2xl font-bold text-gray-900">{customersInDebt}</p>
                                    </div>
                                    <Users className="w-8 h-8 text-gray-400" />
                                </div>
                            </div>
                        </div>
                </div>
            </div>
        </POSLayout>
    );
}
