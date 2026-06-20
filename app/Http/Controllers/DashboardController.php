<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Customer;
use App\Models\Item;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $range = $request->query('range', 'today'); // 'today', 'month', 'year'
        
        $now = Carbon::now();
        
        if ($range === 'month') {
            $startDate = $now->copy()->startOfMonth();
            $endDate = $now->copy()->endOfMonth();
        } elseif ($range === 'year') {
            $startDate = $now->copy()->startOfYear();
            $endDate = $now->copy()->endOfYear();
        } else {
            // Default to today view (but stats logic uses exactly today, trend uses 7 days)
            $startDate = $now->copy()->startOfDay();
            $endDate = $now->copy()->endOfDay();
        }

        // ── Standardized Stats Base Query ─────────────────────────
        // For stats, we strictly bounded by start & end date.
        $invoiceBase = Invoice::whereBetween('created_at', [$startDate, $endDate])->where('status', 'Completed');

        $stats = [
            'revenue_khr' => (int) $invoiceBase->sum('total_khr'),
            
            'profit_khr' => (int) DB::table('invoices')
                ->join('invoice_items', 'invoices.id', '=', 'invoice_items.invoice_id')
                ->leftJoin('items', 'invoice_items.item_name', '=', 'items.name')
                ->whereBetween('invoices.created_at', [$startDate, $endDate])
                ->where('invoices.status', 'Completed')
                ->sum(DB::raw('(invoice_items.custom_price_sold_at - COALESCE(items.default_cost, 0)) * invoice_items.qty')),
                
            'transactions' => (int) $invoiceBase->count(),
            
            'debt_added' => (int) Invoice::whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'Added_To_Debt')
                ->sum('total_khr'),
                
            'payments_collected' => (int) Payment::whereBetween('created_at', [$startDate, $endDate])
                ->sum('amount_paid_khr'),
        ];

        // ── Trend Chart Logic ────────────────────────────────────
        $trendData = [];
        if ($range === 'today') {
            // Last 7 days continuous
            $dates = collect();
            for ($i = 6; $i >= 0; $i--) {
                $d = $now->copy()->subDays($i);
                $dates->put($d->format('Y-m-d'), ['display_date' => $d->format('D'), 'total' => 0]);
            }
            $trendQuery = Invoice::select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_khr) as total'))
                ->where('created_at', '>=', $now->copy()->subDays(6)->startOfDay())
                ->where('status', 'Completed')
                ->groupBy('date')
                ->get();
            foreach ($trendQuery as $row) {
                if ($dates->has($row->date)) {
                    $item = $dates->get($row->date);
                    $item['total'] = (int) $row->total;
                    $dates->put($row->date, $item);
                }
            }
            $trendData = $dates->values()->map(fn($d) => ['date' => $d['display_date'], 'total' => $d['total']]);

        } elseif ($range === 'month') {
            // Group by Week of Month. For simplicity, just divide into 4 weeks.
            $trendQuery = Invoice::select(DB::raw("strftime('%W', created_at) as week"), DB::raw('SUM(total_khr) as total'))
                ->whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'Completed')
                ->groupBy('week')
                ->get();
                
            // Map the sqlite weeks to Week 1, Week 2, etc. relative to the month
            $weekMap = [];
            $firstWeekNum = (int) $startDate->format('W');
            // Ensure 4 or 5 weeks for the chart
            for ($w = 0; $w < 5; $w++) {
                $lbl = sprintf("%02d", $firstWeekNum + $w);
                $weekMap[$lbl] = 0;
            }
            foreach ($trendQuery as $row) {
                $wLabel = sprintf("%02d", (int)$row->week);
                if (isset($weekMap[$wLabel])) {
                    $weekMap[$wLabel] = (int) $row->total;
                } else {
                    $weekMap[$wLabel] = (int) $row->total; // catchall
                }
            }
            
            $i = 1;
            foreach ($weekMap as $wk => $sum) {
                $trendData[] = ['date' => "Wk " . $i, 'total' => $sum];
                $i++;
            }

        } elseif ($range === 'year') {
            // Group by Month (1 to 12)
            $months = collect();
            for ($i = 1; $i <= 12; $i++) {
                $mDisplay = Carbon::create()->month($i)->format('M'); // Jan, Feb
                $months->put(sprintf("%02d", $i), ['display_date' => $mDisplay, 'total' => 0]);
            }
            $trendQuery = Invoice::select(DB::raw("strftime('%m', created_at) as month"), DB::raw('SUM(total_khr) as total'))
                ->whereBetween('created_at', [$startDate, $endDate])
                ->where('status', 'Completed')
                ->groupBy('month')
                ->get();
            foreach ($trendQuery as $row) {
                if ($months->has($row->month)) {
                    $item = $months->get($row->month);
                    $item['total'] = (int) $row->total;
                    $months->put($row->month, $item);
                }
            }
            $trendData = $months->values()->map(fn($d) => ['date' => $d['display_date'], 'total' => $d['total']]);
        }

        // ── Top Items ──────────────────────────────────────
        $topItems = DB::table('invoice_items')
            ->join('invoices', 'invoice_items.invoice_id', '=', 'invoices.id')
            ->whereBetween('invoices.created_at', [$startDate, $endDate])
            ->where('invoices.status', 'Completed')
            ->select(
                'invoice_items.item_name',
                DB::raw('SUM(invoice_items.qty) as total_qty'),
                DB::raw('SUM(invoice_items.qty * invoice_items.custom_price_sold_at) as total_revenue')
            )
            ->groupBy('invoice_items.item_name')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get();

        // ── Payment Method Breakdown ──────────────────────────────────
        $paymentBreakdown = Invoice::select(
                DB::raw("COALESCE(payment_provider, payment_method) as payment_label"),
                DB::raw('SUM(total_khr) as total_value')
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'Completed')
            ->groupBy('payment_label')
            ->get()
            ->map(fn($row) => [
                'name' => $row->payment_label,
                'value' => (int) $row->total_value,
            ]);

        // ── Global Debt Stats ────────────────────────────────────
        $totalDebt = Customer::sum('total_debt_balance');
        $customersInDebt = Customer::where('total_debt_balance', '>', 0)->count();

        return Inertia::render('Dashboard/Index', [
            'range' => $range,
            'stats' => $stats,
            'revenueTrend' => $trendData,
            'topItems' => $topItems,
            'paymentBreakdown' => $paymentBreakdown,
            'totalDebt' => $totalDebt,
            'customersInDebt' => $customersInDebt,
        ]);
    }
}
