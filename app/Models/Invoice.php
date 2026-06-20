<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'invoice_number',
        'customer_id',
        'total_khr',
        'payment_method',
        'payment_provider',
        'status',
    ];

    protected $casts = [
        'total_khr' => 'integer',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function items() // Method name should be items, not invoiceItems, for cleaner API
    {
        return $this->hasMany(InvoiceItem::class);
    }

    protected static function booted()
    {
        static::updating(function ($invoice) {
            throw new \LogicException("Strict invoices cannot be modified.");
        });

        static::deleting(function ($invoice) {
            throw new \LogicException("Strict invoices cannot be deleted.");
        });
    }
}
