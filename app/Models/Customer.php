<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'name',
        'phone_number',
        'total_debt_balance',
        'total_lifetime_spent',
    ];

    protected $casts = [
        'total_debt_balance' => 'integer',
        'total_lifetime_spent' => 'integer',
    ];

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
