<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Item;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Exports\InvoicesExport;
use Maatwebsite\Excel\Facades\Excel;

class InvoiceController extends Controller
{
    /**
     * Display a paginated list of all invoices.
     */
    public function index(Request $request)
    {
        $filters = $this->getFilters($request);

        $invoices = Invoice::with('customer')
            ->when(true, fn ($query) => $this->applyDateFilters($query, $filters))
            ->latest()
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'filters' => $filters,
        ]);
    }

    /**
     * Display the specified invoice with its items for the modal view.
     */
    public function show(Invoice $invoice)
    {
        $invoice->load(['items', 'customer']);
        $this->attachItemImages($invoice);

        return response()->json([
            'invoice' => $invoice
        ]);
    }

    /**
     * Display the specified invoice as a full A4 printable page.
     */
    public function showPage(Invoice $invoice)
    {
        $invoice->load(['items', 'customer']);
        $this->attachItemImages($invoice);

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice
        ]);
    }

    /**
     * Export invoices as an Excel file with applied filters.
     */
    public function export(Request $request)
    {
        $filters = $this->getFilters($request);

        // Generate filename based on period
        $filename = $this->generateExportFilename($filters);

        return Excel::download(
            new InvoicesExport($filters['period'], $filters['from'], $filters['to']),
            $filename
        );
    }

    protected function generateExportFilename(array $filters): string
    {
        $now = now();
        $date = $now->format('Y-m-d');

        switch ($filters['period']) {
            case 'week':
                $start = $now->copy()->startOfWeek()->format('m-d');
                $end = $now->copy()->endOfWeek()->format('m-d');
                return "invoices_week_{$start}_to_{$end}_{$date}.xlsx";

            case 'month':
                $month = $now->format('Y-m');
                return "invoices_month_{$month}.xlsx";

            case 'year':
                $year = $now->format('Y');
                return "invoices_year_{$year}.xlsx";

            case 'range':
                if ($filters['from'] && $filters['to']) {
                    return "invoices_range_{$filters['from']}_to_{$filters['to']}.xlsx";
                }
                break;
        }

        return "invoices_{$date}.xlsx";
    }

    protected function getFilters(Request $request): array
    {
        $validated = $request->validate([
            'period' => 'nullable|string|in:week,month,year,range',
            'from' => 'nullable|date_format:Y-m-d',
            'to' => 'nullable|date_format:Y-m-d|after_or_equal:from',
        ]);

        return [
            'period' => $validated['period'] ?? 'month',
            'from' => $validated['from'] ?? null,
            'to' => $validated['to'] ?? null,
        ];
    }

    protected function applyDateFilters($query, array $filters): void
    {
        $now = now();

        if ($filters['period'] === 'week') {
            $query->whereBetween('created_at', [
                $now->copy()->startOfWeek(),
                $now->copy()->endOfWeek(),
            ]);
            return;
        }

        if ($filters['period'] === 'month') {
            $query->whereBetween('created_at', [
                $now->copy()->startOfMonth(),
                $now->copy()->endOfMonth(),
            ]);
            return;
        }

        if ($filters['period'] === 'year') {
            $query->whereBetween('created_at', [
                $now->copy()->startOfYear(),
                $now->copy()->endOfYear(),
            ]);
            return;
        }

        if (
            $filters['period'] === 'range' &&
            $filters['from'] &&
            $filters['to']
        ) {
            $from = Carbon::parse($filters['from'])->startOfDay();
            $to = Carbon::parse($filters['to'])->endOfDay();

            if ($from->lte($to)) {
                $query->whereBetween('created_at', [$from, $to]);
            }
        }
    }

    protected function attachItemImages(Invoice $invoice): void
    {
        $itemNames = $invoice->items
            ->pluck('item_name')
            ->filter()
            ->unique()
            ->values();

        $images = Item::whereIn('name', $itemNames)
            ->get()
            ->mapWithKeys(fn (Item $item) => [$item->name => $item->image_url]);

        $invoice->items->each(function ($item) use ($images) {
            $item->image_url = $images->get($item->item_name);
        });
    }
}
