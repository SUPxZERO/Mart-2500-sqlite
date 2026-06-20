<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    protected $fillable = [
        'invoice_id',
        'item_name',
        'qty',
        'custom_price_sold_at',
    ];

    protected $casts = [
        'qty' => 'integer',
        'custom_price_sold_at' => 'integer',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    protected static function booted()
    {
        static::updating(function ($item) {
            throw new \LogicException("Strict invoice items cannot be modified.");
        });

        static::deleting(function ($item) {
            throw new \LogicException("Strict invoice items cannot be deleted.");
        });
    }
}
