<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payment_gateways', function (Blueprint $table) {
            $table->string('qr_mode')->default('uploaded_payload')->after('enabled');
            $table->string('khqr_type')->default('individual')->after('qr_mode');
            $table->string('bakong_account_id')->nullable()->after('khqr_type');
            $table->string('account_information')->nullable()->after('bakong_account_id');
            $table->string('acquiring_bank')->nullable()->after('account_information');
            $table->string('merchant_city')->nullable()->after('khqr_payload');
            $table->string('currency_mode')->default('KHR')->after('merchant_city');
            $table->boolean('is_dynamic')->default(false)->after('currency_mode');
            $table->string('bill_number_prefix')->nullable()->after('is_dynamic');
            $table->string('store_label')->nullable()->after('bill_number_prefix');
            $table->string('terminal_label')->nullable()->after('store_label');
            $table->string('purpose_of_transaction')->nullable()->after('terminal_label');
            $table->string('merchant_category_code')->nullable()->after('purpose_of_transaction');
            $table->unsignedInteger('expiration_minutes')->default(15)->after('merchant_category_code');
        });

        DB::table('payment_gateways')
            ->whereNull('bakong_account_id')
            ->update([
                'bakong_account_id' => DB::raw('bakong_id'),
            ]);

        DB::table('payment_gateways')
            ->whereNull('merchant_city')
            ->update([
                'merchant_city' => 'Phnom Penh',
            ]);

        DB::table('payment_gateways')
            ->where('code', 'bakong')
            ->update(['khqr_type' => 'individual']);

        DB::table('payment_gateways')
            ->whereIn('code', ['aba', 'acleda'])
            ->update(['khqr_type' => 'merchant']);
    }

    public function down(): void
    {
        Schema::table('payment_gateways', function (Blueprint $table) {
            $table->dropColumn([
                'qr_mode',
                'khqr_type',
                'bakong_account_id',
                'account_information',
                'acquiring_bank',
                'merchant_city',
                'currency_mode',
                'is_dynamic',
                'bill_number_prefix',
                'store_label',
                'terminal_label',
                'purpose_of_transaction',
                'merchant_category_code',
                'expiration_minutes',
            ]);
        });
    }
};
