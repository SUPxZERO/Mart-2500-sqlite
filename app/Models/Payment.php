<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'customer_id',
        'amount_paid_khr',
        'payment_method',
        'payment_provider',
    ];

    protected $casts = [
        'amount_paid_khr' => 'integer',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
