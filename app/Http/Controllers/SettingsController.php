<?php

namespace App\Http\Controllers;

use App\Models\ExchangeRate;
use App\Models\PaymentGateway;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        PaymentGateway::ensureDefaults();

        $appUrl = (string) config('app.url');
        $appUrlHost = parse_url($appUrl, PHP_URL_HOST);
        $appUrlIsLocalhost = in_array($appUrlHost, ['localhost', '127.0.0.1', '::1'], true);
        $sessionDriver = (string) config('session.driver');
        $cacheStore = (string) config('cache.default');
        $queueConnection = (string) config('queue.default');
        $publicStorageReady = is_dir(public_path('storage')) || is_link(public_path('storage'));
        $sqliteReady = file_exists(database_path('database.sqlite'));
        $exchangeRateReady = ExchangeRate::query()->exists();
        $enabledGatewayCount = PaymentGateway::query()->where('enabled', true)->count();

        $diagnostics = [
            [
                'label' => 'SQLite database file',
                'status' => $sqliteReady ? 'pass' : 'fail',
                'detail' => $sqliteReady
                    ? 'Local database file exists.'
                    : 'database/database.sqlite is missing.',
            ],
            [
                'label' => 'Public storage link',
                'status' => $publicStorageReady ? 'pass' : 'fail',
                'detail' => $publicStorageReady
                    ? 'Product images can be served from local disk.'
                    : 'Run php artisan storage:link on this machine.',
            ],
            [
                'label' => 'Session driver',
                'status' => $sessionDriver === 'file' ? 'pass' : 'warn',
                'detail' => $sessionDriver === 'file'
                    ? 'Session driver is local file storage.'
                    : "Current driver is {$sessionDriver}. File is recommended for offline use.",
            ],
            [
                'label' => 'Cache store',
                'status' => $cacheStore === 'file' ? 'pass' : 'warn',
                'detail' => $cacheStore === 'file'
                    ? 'Cache store is local file storage.'
                    : "Current cache store is {$cacheStore}. File is recommended for offline use.",
            ],
            [
                'label' => 'Queue connection',
                'status' => $queueConnection === 'sync' ? 'pass' : 'warn',
                'detail' => $queueConnection === 'sync'
                    ? 'Queue runs inline with no worker dependency.'
                    : "Current queue connection is {$queueConnection}. Sync is recommended offline.",
            ],
            [
                'label' => 'Application URL',
                'status' => $appUrlIsLocalhost ? 'warn' : 'pass',
                'detail' => $appUrlIsLocalhost
                    ? 'Localhost works on one machine only. Use the server IP for LAN cashiers.'
                    : "APP_URL is set to {$appUrl}.",
            ],
            [
                'label' => 'Exchange rate record',
                'status' => $exchangeRateReady ? 'pass' : 'warn',
                'detail' => $exchangeRateReady
                    ? 'Exchange rate is configured.'
                    : 'No exchange rate saved yet. Checkout will fall back to the default value.',
            ],
            [
                'label' => 'Enabled payment methods',
                'status' => $enabledGatewayCount > 0 ? 'pass' : 'warn',
                'detail' => $enabledGatewayCount > 0
                    ? "{$enabledGatewayCount} payment method(s) enabled for checkout."
                    : 'No bank/app payment methods are enabled in settings.',
            ],
        ];

        $offlineScore = collect($diagnostics)
            ->reject(fn ($check) => $check['status'] === 'warn')
            ->count();

        return Inertia::render('Settings/Index', [
            'exchangeRate' => ExchangeRate::first(),
            'paymentGateways' => PaymentGateway::orderBy('sort_order')->get(),
            'offlineStatus' => [
                'app_url' => $appUrl,
                'app_url_is_localhost' => $appUrlIsLocalhost,
                'session_driver' => $sessionDriver,
                'cache_store' => $cacheStore,
                'queue_connection' => $queueConnection,
                'public_storage_ready' => $publicStorageReady,
                'sqlite_ready' => $sqliteReady,
                'exchange_rate_ready' => $exchangeRateReady,
                'enabled_gateway_count' => $enabledGatewayCount,
                'diagnostics' => $diagnostics,
                'offline_score' => $offlineScore,
                'offline_total' => count($diagnostics),
            ],
        ]);
    }

    /**
     * Update or create the single exchange rate record.
     */
    public function updateRate(Request $request)
    {
        $validated = $request->validate([
            'usd_to_khr' => 'required|integer|min:3000|max:10000'
        ]);

        ExchangeRate::updateOrCreate(
            ['id' => 1],
            ['usd_to_khr' => $validated['usd_to_khr']]
        );

        return back()->with('success', 'Exchange rate updated successfully!');
    }

    public function updatePaymentMethods(Request $request)
    {
        PaymentGateway::ensureDefaults();

        $validated = $request->validate([
            'gateways' => 'required|array|min:1',
            'gateways.*.code' => 'required|string|exists:payment_gateways,code',
            'gateways.*.display_name' => 'required|string|max:255',
            'gateways.*.enabled' => 'required|boolean',
            'gateways.*.qr_mode' => 'required|string|in:uploaded_payload,generated_individual,generated_merchant',
            'gateways.*.khqr_type' => 'required|string|in:individual,merchant',
            'gateways.*.bakong_account_id' => 'nullable|string|max:255',
            'gateways.*.account_information' => 'nullable|string|max:255',
            'gateways.*.acquiring_bank' => 'nullable|string|max:255',
            'gateways.*.account_name' => 'nullable|string|max:255',
            'gateways.*.account_number' => 'nullable|string|max:255',
            'gateways.*.phone_number' => 'nullable|string|max:255',
            'gateways.*.merchant_id' => 'nullable|string|max:255',
            'gateways.*.bakong_id' => 'nullable|string|max:255',
            'gateways.*.khqr_payload' => 'nullable|string|max:5000',
            'gateways.*.merchant_city' => 'nullable|string|max:255',
            'gateways.*.currency_mode' => 'required|string|in:KHR,USD',
            'gateways.*.is_dynamic' => 'required|boolean',
            'gateways.*.bill_number_prefix' => 'nullable|string|max:255',
            'gateways.*.store_label' => 'nullable|string|max:255',
            'gateways.*.terminal_label' => 'nullable|string|max:255',
            'gateways.*.purpose_of_transaction' => 'nullable|string|max:255',
            'gateways.*.merchant_category_code' => 'nullable|string|max:4',
            'gateways.*.expiration_minutes' => 'nullable|integer|min:1|max:1440',
            'gateways.*.supports_khqr' => 'required|boolean',
            'gateways.*.instructions' => 'nullable|string|max:1000',
        ]);

        foreach ($validated['gateways'] as $index => $gateway) {
            PaymentGateway::where('code', $gateway['code'])->update([
                'display_name' => $gateway['display_name'],
                'enabled' => $gateway['enabled'],
                'qr_mode' => $gateway['qr_mode'],
                'khqr_type' => $gateway['khqr_type'],
                'bakong_account_id' => $gateway['bakong_account_id'],
                'account_information' => $gateway['account_information'],
                'acquiring_bank' => $gateway['acquiring_bank'],
                'account_name' => $gateway['account_name'],
                'account_number' => $gateway['account_number'],
                'phone_number' => $gateway['phone_number'],
                'merchant_id' => $gateway['merchant_id'],
                'bakong_id' => $gateway['bakong_id'],
                'khqr_payload' => $gateway['khqr_payload'],
                'merchant_city' => $gateway['merchant_city'],
                'currency_mode' => $gateway['currency_mode'],
                'is_dynamic' => $gateway['is_dynamic'],
                'bill_number_prefix' => $gateway['bill_number_prefix'],
                'store_label' => $gateway['store_label'],
                'terminal_label' => $gateway['terminal_label'],
                'purpose_of_transaction' => $gateway['purpose_of_transaction'],
                'merchant_category_code' => $gateway['merchant_category_code'],
                'expiration_minutes' => $gateway['expiration_minutes'] ?? 15,
                'supports_khqr' => $gateway['supports_khqr'],
                'instructions' => $gateway['instructions'],
                'sort_order' => $index + 1,
            ]);
        }

        return redirect()
            ->route('settings')
            ->with('success', 'Payment methods updated successfully!');
    }

    /**
     * Trigger a download of the Database and Images as a backup ZIP.
     */
    public function downloadBackup()
    {
        $zipFile = storage_path('app/mart2500-backup-' . now()->format('Y-m-d_H-i-s') . '.zip');
        
        $zip = new \ZipArchive();

        if ($zip->open($zipFile, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== TRUE) {
            abort(500, 'Could not create backup zip file.');
        }

        // Export Database to JSON for cross-database compatibility (SQLite, PostgreSQL, MySQL)
        $tables = [
            'users',
            'categories',
            'items',
            'customers',
            'invoices',
            'invoice_items',
            'payments',
            'exchange_rates',
            'payment_gateways'
        ];

        $databaseExport = [];
        foreach ($tables as $table) {
            $databaseExport[$table] = \Illuminate\Support\Facades\DB::table($table)->get()->map(function ($item) {
                return (array) $item;
            })->toArray();
        }

        $zip->addFromString('database.json', json_encode($databaseExport));

        // Add Public Storage (Images)
        $publicPath = storage_path('app/public');
        if (is_dir($publicPath)) {
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($publicPath),
                \RecursiveIteratorIterator::LEAVES_ONLY
            );

            foreach ($files as $name => $file) {
                if (!$file->isDir()) {
                    $filePath = $file->getRealPath();
                    $relativePath = 'public/' . substr($filePath, strlen($publicPath) + 1);
                    $relativePath = str_replace('\\', '/', $relativePath);
                    $zip->addFile($filePath, $relativePath);
                }
            }
        }

        $zip->close();

        return response()->download($zipFile)->deleteFileAfterSend(true);
    }

    /**
     * Restore database and images from an uploaded ZIP backup.
     */
    public function restoreBackup(Request $request)
    {
        $request->validate([
            'database' => 'required|file'
        ]);

        $file = $request->file('database');

        if ($file->getClientOriginalExtension() !== 'zip') {
            return back()->withErrors(['database' => 'The uploaded file must be a .zip backup archive.']);
        }

        $zip = new \ZipArchive();
        if ($zip->open($file->getRealPath()) === TRUE) {
            
            $hasJson = $zip->locateName('database.json') !== false;
            $hasSqlite = $zip->locateName('database.sqlite') !== false;

            if (!$hasJson && !$hasSqlite) {
                $zip->close();
                return back()->withErrors(['database' => 'Invalid backup file: missing database.json or database.sqlite.']);
            }

            // Define tables in dependency order (parents first for insertion, but we will delete in reverse order)
            $tables = [
                'users',
                'categories',
                'customers',
                'items',
                'invoices',
                'invoice_items',
                'payments',
                'exchange_rates',
                'payment_gateways'
            ];

            \Illuminate\Support\Facades\DB::beginTransaction();

            try {
                // Determine if we need to cast booleans explicitly (important for strictly typed DBs like Postgres)
                $isPostgres = \Illuminate\Support\Facades\DB::connection()->getDriverName() === 'pgsql';
                $tableBoolColumns = [];

                if ($isPostgres) {
                    foreach ($tables as $table) {
                        $columns = \Illuminate\Support\Facades\Schema::getColumns($table);
                        $boolCols = [];
                        foreach ($columns as $column) {
                            $type = strtolower($column['type_name'] ?? $column['type'] ?? '');
                            if ($type === 'boolean' || $type === 'bool') {
                                $boolCols[] = $column['name'];
                            }
                        }
                        $tableBoolColumns[$table] = $boolCols;
                    }
                }

                // Delete existing records in reverse order to respect foreign keys
                foreach (array_reverse($tables) as $table) {
                    \Illuminate\Support\Facades\DB::table($table)->delete();
                }

                // Restore from JSON (New Backup Format)
                if ($hasJson) {
                    $jsonContent = $zip->getFromName('database.json');
                    $databaseImport = json_decode($jsonContent, true);

                    foreach ($tables as $table) {
                        if (isset($databaseImport[$table]) && count($databaseImport[$table]) > 0) {
                            $records = $databaseImport[$table];
                            
                            // Type casting for Postgres
                            if ($isPostgres && !empty($tableBoolColumns[$table])) {
                                foreach ($records as &$row) {
                                    foreach ($tableBoolColumns[$table] as $col) {
                                        if (array_key_exists($col, $row)) {
                                            $row[$col] = (bool) $row[$col];
                                        }
                                    }
                                }
                            }

                            $chunks = array_chunk($records, 500);
                            foreach ($chunks as $chunk) {
                                \Illuminate\Support\Facades\DB::table($table)->insert($chunk);
                            }
                        }
                    }
                } 
                // Restore from SQLite (Backwards Compatibility for Old Backups)
                elseif ($hasSqlite) {
                    $tempSqlitePath = storage_path('app/temp_restore_database_' . time() . '.sqlite');
                    file_put_contents($tempSqlitePath, $zip->getFromName('database.sqlite'));

                    config(['database.connections.backup_sqlite' => [
                        'driver' => 'sqlite',
                        'database' => $tempSqlitePath,
                        'prefix' => '',
                        'foreign_key_constraints' => false,
                    ]]);

                    foreach ($tables as $table) {
                        $records = \Illuminate\Support\Facades\DB::connection('backup_sqlite')->table($table)->get()->map(function ($item) {
                            return (array) $item;
                        })->toArray();

                        if (count($records) > 0) {
                            // Type casting for Postgres
                            if ($isPostgres && !empty($tableBoolColumns[$table])) {
                                foreach ($records as &$row) {
                                    foreach ($tableBoolColumns[$table] as $col) {
                                        if (array_key_exists($col, $row)) {
                                            $row[$col] = (bool) $row[$col];
                                        }
                                    }
                                }
                            }

                            $chunks = array_chunk($records, 500);
                            foreach ($chunks as $chunk) {
                                \Illuminate\Support\Facades\DB::table($table)->insert($chunk);
                            }
                        }
                    }

                    if (file_exists($tempSqlitePath)) {
                        unlink($tempSqlitePath);
                    }
                }

                // Reset auto-increment sequences for PostgreSQL so future inserts don't fail
                if ($isPostgres) {
                    foreach ($tables as $table) {
                        $seqObj = \Illuminate\Support\Facades\DB::selectOne("SELECT pg_get_serial_sequence('{$table}', 'id') AS seq");
                        if ($seqObj && $seqObj->seq) {
                            $maxId = \Illuminate\Support\Facades\DB::table($table)->max('id') ?? 0;
                            if ($maxId > 0) {
                                \Illuminate\Support\Facades\DB::statement("SELECT setval('{$seqObj->seq}', {$maxId})");
                            }
                        }
                    }
                }

                \Illuminate\Support\Facades\DB::commit();

            } catch (\Exception $e) {
                \Illuminate\Support\Facades\DB::rollBack();
                $zip->close();
                return back()->withErrors(['database' => 'Database restore failed: ' . $e->getMessage()]);
            }

            // Extract public images
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $filename = $zip->getNameIndex($i);
                
                if (str_starts_with($filename, 'public/')) {
                    $zip->extractTo(storage_path('app'), array($filename));
                }
            }

            $zip->close();

            // Clear application cache to ensure no stale data
            \Illuminate\Support\Facades\Artisan::call('cache:clear');

            return back()->with('success', 'Backup restored successfully! The page will now reload.');
        } else {
            return back()->withErrors(['database' => 'Failed to open the zip archive.']);
        }
    }
}
