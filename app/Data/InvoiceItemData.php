<?php

namespace App\Data;

use Spatie\LaravelData\Data;

class InvoiceItemData extends Data
{
    public function __construct(
        public readonly int $id,
        public readonly string $name,
        public readonly int $qty,
        public readonly int $custom_price_sold_at,
    ) {}
}
