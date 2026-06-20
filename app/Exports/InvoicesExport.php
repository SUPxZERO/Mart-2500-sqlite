<?php

namespace App\Exports;

use App\Models\Invoice;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithHeadings;

class InvoicesExport implements FromQuery, WithMapping, WithHeadings
{
    public function __construct(
        protected ?string $period = null,
        protected ?string $from = null,
        protected ?string $to = null,
    ) {
    }

    public function query()
    {
        $query = Invoice::query()->with('customer')
            ->when(true, fn ($q) => $this->applyDateFilters($q))
            ->latest('created_at');

        return $query;
    }

    public function headings(): array
    {
        return [
            'Invoice Number',
            'Date',
            'Customer',
            'Payment Method',
            'Status',
            'Invoice Total (KHR)',
        ];
    }

    public function map($invoice): array
    {
        return [
            $invoice->invoice_number,
            $invoice->created_at->format('Y-m-d H:i:s'),
            $invoice->customer ? $invoice->customer->name : 'Walk-in Customer',
            $invoice->payment_method,
            $invoice->status,
            $invoice->total_khr,
        ];
    }

    protected function applyDateFilters($query): void
    {
        $now = now();

        if ($this->period === 'week') {
            $query->whereBetween('created_at', [
                $now->copy()->startOfWeek(),
                $now->copy()->endOfWeek(),
            ]);
            return;
        }

        if ($this->period === 'month') {
            $query->whereBetween('created_at', [
                $now->copy()->startOfMonth(),
                $now->copy()->endOfMonth(),
            ]);
            return;
        }

        if ($this->period === 'year') {
            $query->whereBetween('created_at', [
                $now->copy()->startOfYear(),
                $now->copy()->endOfYear(),
            ]);
            return;
        }

        if ($this->period === 'range' && $this->from && $this->to) {
            $from = Carbon::parse($this->from)->startOfDay();
            $to = Carbon::parse($this->to)->endOfDay();

            if ($from->lte($to)) {
                $query->whereBetween('created_at', [$from, $to]);
            }
        }
    }
}
