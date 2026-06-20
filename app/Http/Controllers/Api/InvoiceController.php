<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Data\StoreInvoiceRequest;
use App\Models\Invoice;
use App\Models\Customer;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function store(StoreInvoiceRequest $request)
    {
        return DB::transaction(function () use ($request) {
            
            // 1. Calculate strict total from DTO immediately
            $totalKhr = collect($request->items)->sum(function ($item) {
                $qty = is_array($item) ? $item['qty'] : $item->qty;
                $price = is_array($item) ? $item['custom_price_sold_at'] : $item->custom_price_sold_at;
                return $qty * $price;
            });
            
            // 2. Generate a sequential or random invoice number. For local POS, rand is usually fine or a date string.
            $invoiceNumber = 'INV-' . now()->format('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

            // 3. Create the Invoice Record
            $invoice = Invoice::create([
                'invoice_number' => $invoiceNumber,
                'customer_id'    => $request->customer_id,
                'total_khr'      => $totalKhr,
                'payment_method' => $request->payment_method,
                'payment_provider' => $request->payment_provider,
                'status'         => $request->payment_method === 'Unpaid_Debt' ? 'Added_To_Debt' : 'Completed',
            ]);

            // 4. Create the nested Invoice Items
            foreach ($request->items as $item) {
                $itemName = is_array($item) ? $item['name'] : $item->name;
                $qty = is_array($item) ? $item['qty'] : $item->qty;
                $customPrice = is_array($item) ? $item['custom_price_sold_at'] : $item->custom_price_sold_at;
                
                $invoice->items()->create([
                    'item_name'            => $itemName,
                    'qty'                  => $qty,
                    'custom_price_sold_at' => $customPrice,
                ]);
            }

            // 5. Handle Customer History & Debt
            if ($request->customer_id) {
                $customer = Customer::find($request->customer_id);
                
                if ($customer) {
                    if ($request->payment_method === 'Unpaid_Debt') {
                        // Increase their debt
                        $customer->increment('total_debt_balance', $totalKhr);
                    } else {
                        // Increase their lifetime spent value
                        $customer->increment('total_lifetime_spent', $totalKhr);
                        
                        // Log a payment record
                        Payment::create([
                            'customer_id'     => $customer->id,
                            'amount_paid_khr' => $totalKhr,
                            'payment_method'  => $request->payment_method,
                            'payment_provider' => $request->payment_provider,
                        ]);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'invoice_number' => $invoiceNumber,
                'message' => 'Transaction Complete'
            ]);
        });
    }
}
