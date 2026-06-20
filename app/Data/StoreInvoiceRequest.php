<?php

namespace App\Data;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\Attributes\DataCollectionOf;

class StoreInvoiceRequest extends Data
{
    public function __construct(
        public readonly ?int $customer_id,
        public readonly string $payment_method,
        public readonly ?string $payment_provider,
        public readonly int $received_khr,
        
        #[DataCollectionOf(InvoiceItemData::class)]
        public readonly array $items,
    ) {}
}
