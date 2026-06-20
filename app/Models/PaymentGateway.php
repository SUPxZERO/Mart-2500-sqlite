<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentGateway extends Model
{
    protected $fillable = [
        'code',
        'display_name',
        'enabled',
        'qr_mode',
        'khqr_type',
        'bakong_account_id',
        'bank_code',
        'account_information',
        'acquiring_bank',
        'account_name',
        'account_number',
        'phone_number',
        'merchant_id',
        'bakong_id',
        'khqr_payload',
        'merchant_city',
        'currency_mode',
        'is_dynamic',
        'bill_number_prefix',
        'store_label',
        'terminal_label',
        'purpose_of_transaction',
        'merchant_category_code',
        'expiration_minutes',
        'supports_khqr',
        'sort_order',
        'instructions',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'is_dynamic' => 'boolean',
        'supports_khqr' => 'boolean',
        'expiration_minutes' => 'integer',
        'sort_order' => 'integer',
    ];

    public static function defaultDefinitions(): array
    {
        return [
            [
                'code' => 'bakong',
                'display_name' => 'Bakong',
                'enabled' => true,
                'qr_mode' => 'uploaded_payload',
                'khqr_type' => 'individual',
                'bakong_account_id' => null,
                'account_information' => null,
                'acquiring_bank' => null,
                'account_name' => 'Mart 2500',
                'account_number' => null,
                'phone_number' => null,
                'merchant_id' => null,
                'bakong_id' => null,
                'khqr_payload' => null,
                'merchant_city' => 'Phnom Penh',
                'currency_mode' => 'KHR',
                'is_dynamic' => false,
                'bill_number_prefix' => null,
                'store_label' => null,
                'terminal_label' => null,
                'purpose_of_transaction' => null,
                'merchant_category_code' => '5999',
                'expiration_minutes' => 15,
                'supports_khqr' => true,
                'sort_order' => 1,
                'instructions' => 'Use uploaded KHQR or generated Bakong-compatible KHQR.',
            ],
            [
                'code' => 'aba',
                'display_name' => 'ABA Bank',
                'enabled' => true,
                'qr_mode' => 'uploaded_payload',
                'khqr_type' => 'merchant',
                'bakong_account_id' => null,
                'account_information' => null,
                'acquiring_bank' => null,
                'account_name' => 'Mart 2500',
                'account_number' => null,
                'phone_number' => null,
                'merchant_id' => null,
                'bakong_id' => null,
                'khqr_payload' => null,
                'merchant_city' => 'Phnom Penh',
                'currency_mode' => 'KHR',
                'is_dynamic' => false,
                'bill_number_prefix' => null,
                'store_label' => null,
                'terminal_label' => null,
                'purpose_of_transaction' => null,
                'merchant_category_code' => '5999',
                'expiration_minutes' => 15,
                'supports_khqr' => true,
                'sort_order' => 2,
                'instructions' => 'Use uploaded ABA/ KHQR or generated merchant KHQR if you have the required merchant details.',
            ],
            [
                'code' => 'acleda',
                'display_name' => 'ACLEDA',
                'enabled' => false,
                'qr_mode' => 'uploaded_payload',
                'khqr_type' => 'merchant',
                'bakong_account_id' => null,
                'account_information' => null,
                'acquiring_bank' => null,
                'account_name' => 'Mart 2500',
                'account_number' => null,
                'phone_number' => null,
                'merchant_id' => null,
                'bakong_id' => null,
                'khqr_payload' => null,
                'merchant_city' => 'Phnom Penh',
                'currency_mode' => 'KHR',
                'is_dynamic' => false,
                'bill_number_prefix' => null,
                'store_label' => null,
                'terminal_label' => null,
                'purpose_of_transaction' => null,
                'merchant_category_code' => '5999',
                'expiration_minutes' => 15,
                'supports_khqr' => true,
                'sort_order' => 3,
                'instructions' => 'Use uploaded ACLEDA My KHQR or generated merchant KHQR if you have the required merchant details.',
            ],
        ];
    }

    public static function ensureDefaults(): void
    {
        foreach (self::defaultDefinitions() as $gateway) {
            self::firstOrCreate(
                ['code' => $gateway['code']],
                $gateway,
            );
        }
    }
}
