import { useEffect, useState } from 'react';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import { t } from '@/i18n';
import POSLayout from '@/Layouts/POSLayout';
import { Settings, RefreshCw, Download, Upload, CheckCircle2, AlertCircle, AlertTriangle, Landmark } from 'lucide-react';
import { buildGatewayKhqr } from '@/utils/khqr';

export default function SettingsIndex({ exchangeRate, paymentGateways, offlineStatus }) {
    const { flash } = usePage().props;
    const [rate, setRate] = useState(exchangeRate?.usd_to_khr || 4000);
    const [gateways, setGateways] = useState(paymentGateways || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingGateways, setIsSavingGateways] = useState(false);

    const { data: restoreData, setData: setRestoreData, post: postRestore, processing: isRestoring, errors: restoreErrors, reset: resetRestore } = useForm({
        database: null,
    });
    const [showRestoreWarning, setShowRestoreWarning] = useState(false);

    const handleRestore = (e) => {
        e.preventDefault();
        if (!restoreData.database) return;
        postRestore('/settings/restore', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowRestoreWarning(false);
                resetRestore();
                window.location.reload();
            },
        });
    };

    useEffect(() => {
        setGateways(paymentGateways || []);
    }, [paymentGateways]);

    const handleUpdateRate = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post('/settings/rate', { usd_to_khr: parseInt(rate) }, {
            preserveScroll: true,
            onFinish: () => setIsSubmitting(false)
        });
    };

    const updateGateway = (code, field, value) => {
        setGateways((current) =>
            current.map((gateway) =>
                gateway.code === code ? { ...gateway, [field]: value } : gateway,
            ),
        );
    };

    const handleSaveGateways = (e) => {
        e.preventDefault();
        setIsSavingGateways(true);
        router.post(
            '/settings/payment-methods',
            {
                gateways: gateways.map((gateway) => ({
                    code: gateway.code,
                    display_name: gateway.display_name,
                    enabled: !!gateway.enabled,
                    qr_mode: gateway.qr_mode || 'uploaded_payload',
                    khqr_type: gateway.khqr_type || 'individual',
                    bakong_account_id: gateway.bakong_account_id || '',
                    bank_code: gateway.bank_code || '',
                    account_information: gateway.account_information || '',
                    acquiring_bank: gateway.acquiring_bank || '',
                    account_name: gateway.account_name || '',
                    account_number: gateway.account_number || '',
                    phone_number: gateway.phone_number || '',
                    merchant_id: gateway.merchant_id || '',
                    bakong_id: gateway.bakong_id || '',
                    khqr_payload: gateway.khqr_payload || '',
                    merchant_city: gateway.merchant_city || 'Phnom Penh',
                    currency_mode: gateway.currency_mode || 'KHR',
                    is_dynamic: !!gateway.is_dynamic,
                    bill_number_prefix: gateway.bill_number_prefix || '',
                    store_label: gateway.store_label || '',
                    terminal_label: gateway.terminal_label || '',
                    purpose_of_transaction: gateway.purpose_of_transaction || '',
                    merchant_category_code: gateway.merchant_category_code || '5999',
                    expiration_minutes: gateway.expiration_minutes || 15,
                    supports_khqr: !!gateway.supports_khqr,
                    instructions: gateway.instructions || '',
                })),
            },
            {
                preserveState: false,
                preserveScroll: true,
                onFinish: () => setIsSavingGateways(false),
            },
        );
    };

    return (
        <POSLayout
            title={t('settings.title')}
            description={t('settings.description')}
            icon={Settings}
            contentWidth="narrow"
            contentClassName="space-y-6"
        >
            <Head title={t('settings.page_title')} />

            {flash?.success && (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 shrink-0">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <p className="font-medium">{flash.success}</p>
                </div>
            )}

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shrink-0">
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                    <h2 className="flex items-center gap-2 font-bold text-slate-700">
                        <Landmark className="h-4 w-4 text-emerald-400" />
                        Payment Methods
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                        Enable Bakong, ABA, and ACLEDA here and configure the local details shown at checkout for offline manual confirmation.
                    </p>
                </div>

                <form onSubmit={handleSaveGateways} className="space-y-6 p-6">
                    {gateways.map((gateway) => (
                        <div key={gateway.code} className="rounded-2xl border border-slate-200 p-5">
                            {(() => {
                                const khqrPreview = buildGatewayKhqr(gateway, {
                                    amountKhr: gateway.is_dynamic ? 10000 : null,
                                    exchangeRate,
                                });
                                const isUploadedMode =
                                    (gateway.qr_mode || 'uploaded_payload') ===
                                    'uploaded_payload';
                                const isMerchantMode =
                                    gateway.qr_mode === 'generated_merchant';
                                const isIndividualMode =
                                    gateway.qr_mode === 'generated_individual';

                                return (
                                    <>
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-lg font-bold text-slate-800">{gateway.code.toUpperCase()}</p>
                                    <p className="text-sm text-slate-500">
                                        This provider will appear in checkout when enabled. No bank API or live verification is required.
                                    </p>
                                </div>

                                <label className="inline-flex items-center gap-3 rounded-full bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={!!gateway.enabled}
                                        onChange={(e) => updateGateway(gateway.code, 'enabled', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    Enabled
                                </label>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-700">QR Mode</label>
                                    <select
                                        value={gateway.qr_mode || 'uploaded_payload'}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            updateGateway(gateway.code, 'qr_mode', value);
                                            updateGateway(
                                                gateway.code,
                                                'khqr_type',
                                                value === 'generated_merchant' ? 'merchant' : 'individual',
                                            );
                                        }}
                                        className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    >
                                        <option value="uploaded_payload">Uploaded bank KHQR payload</option>
                                        <option value="generated_individual">Generated KHQR - Individual</option>
                                        <option value="generated_merchant">Generated KHQR - Merchant</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-700">Currency Mode</label>
                                    <select
                                        value={gateway.currency_mode || 'KHR'}
                                        onChange={(e) => updateGateway(gateway.code, 'currency_mode', e.target.value)}
                                        className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    >
                                        <option value="KHR">KHR</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-bold text-slate-700">Display Name</label>
                                    <input
                                        type="text"
                                        value={gateway.display_name || ''}
                                        onChange={(e) => updateGateway(gateway.code, 'display_name', e.target.value)}
                                        className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>
                                {!isUploadedMode && (
                                    <>
                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-slate-700">Merchant / Account Name</label>
                                            <input
                                                type="text"
                                                value={gateway.account_name || ''}
                                                onChange={(e) => updateGateway(gateway.code, 'account_name', e.target.value)}
                                                placeholder="e.g., Mart 2500"
                                                className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                            />
                                            <p className="mt-2 text-xs text-slate-500">
                                                Your business/merchant name. This appears on the QR code when customers scan it.
                                            </p>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-slate-700">Bakong Account ID</label>
                                            <input
                                                type="text"
                                                value={gateway.bakong_account_id || gateway.bakong_id || ''}
                                                onChange={(e) => {
                                                    updateGateway(gateway.code, 'bakong_account_id', e.target.value);
                                                    updateGateway(gateway.code, 'bakong_id', e.target.value);
                                                }}
                                                placeholder="e.g., sokang_seng or sokang_seng@aclb"
                                                className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                            />
                                            <p className="mt-2 text-xs text-slate-500">
                                                Your Bakong username or account. Format: username@bankcode (e.g., sokang_seng@aclb). Get from Bakong merchant portal.
                                            </p>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-slate-700">Bank Code</label>
                                            <select
                                                value={gateway.bank_code || 'aclb'}
                                                onChange={(e) => updateGateway(gateway.code, 'bank_code', e.target.value)}
                                                className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                            >
                                                <option value="">-- Select your bank --</option>
                                                <option value="aclb">ACLB (Angkor Commercial Bank)</option>
                                                <option value="aba">ABA Bank</option>
                                                <option value="nbc">NBC (National Bank of Cambodia)</option>
                                                <option value="canadia">Canadia Bank</option>
                                                <option value="metfone">Metfone</option>
                                                <option value="vattanac">Vattanac Bank</option>
                                            </select>
                                            <p className="mt-2 text-xs text-slate-500">
                                                Your bank. Used to auto-format account ID as username@bankcode when generating KHQR.
                                            </p>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-slate-700">Merchant City</label>
                                            <input
                                                type="text"
                                                value={gateway.merchant_city || ''}
                                                onChange={(e) => updateGateway(gateway.code, 'merchant_city', e.target.value)}
                                                placeholder="e.g., Phnom Penh"
                                                className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                            />
                                            <p className="mt-2 text-xs text-slate-500">
                                                City where your merchant business is located. This appears on KHQR transactions.
                                            </p>
                                        </div>
                                    </>
                                )}

                                {isMerchantMode && (
                                    <>
                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-slate-700">Merchant ID</label>
                                            <input
                                                type="text"
                                                value={gateway.merchant_id || ''}
                                                onChange={(e) => updateGateway(gateway.code, 'merchant_id', e.target.value)}
                                                placeholder="e.g., 12345678"
                                                className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                            />
                                            <p className="mt-2 text-xs text-slate-500">
                                                Your merchant ID from the acquiring bank or Bakong merchant portal.
                                            </p>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-bold text-slate-700">Acquiring Bank</label>
                                            <input
                                                type="text"
                                                value={gateway.acquiring_bank || ''}
                                                onChange={(e) => updateGateway(gateway.code, 'acquiring_bank', e.target.value)}
                                                placeholder="Example: BKKHKHPP (SWIFT code of your bank)"
                                                className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                            />
                                            <p className="mt-2 text-xs text-slate-500">
                                                Your bank's SWIFT code (8-11 letters). Example: BKKHKHPP for National Bank of Cambodia.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="mt-4 space-y-3">
                                {isUploadedMode && (
                                    <div>
                                        <label className="mb-2 block text-sm font-bold text-slate-700">Real KHQR Payload</label>
                                        <textarea
                                            value={gateway.khqr_payload || ''}
                                            onChange={(e) => updateGateway(gateway.code, 'khqr_payload', e.target.value)}
                                            rows={4}
                                            placeholder="Paste the real KHQR payload generated by your bank app/merchant portal here."
                                            className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                        />
                                        <p className="mt-2 text-xs text-slate-400">
                                            Use the exact KHQR string from the bank app. This is the minimum input for uploaded QR mode.
                                        </p>
                                    </div>
                                )}

                                {!isUploadedMode && (
                                    <>
                                        <label className="inline-flex items-center gap-3 text-sm font-bold text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={!!gateway.is_dynamic}
                                                onChange={(e) => updateGateway(gateway.code, 'is_dynamic', e.target.checked)}
                                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            Generate dynamic KHQR with checkout amount
                                        </label>

                                        {gateway.is_dynamic && (
                                            <div>
                                                <label className="mb-2 block text-sm font-bold text-slate-700">Expiration Minutes</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="1440"
                                                    value={gateway.expiration_minutes || 15}
                                                    onChange={(e) => updateGateway(gateway.code, 'expiration_minutes', e.target.value)}
                                                    className="block w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                                />
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">KHQR Preview</p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {isUploadedMode
                                                    ? 'Checks whether the saved bank KHQR payload is valid.'
                                                    : 'Dynamic preview uses a sample amount of 10,000 KHR.'}
                                            </p>
                                        </div>
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                                khqrPreview.ok
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-rose-100 text-rose-700'
                                            }`}
                                        >
                                            {khqrPreview.ok ? 'Valid' : 'Invalid'}
                                        </span>
                                    </div>

                                    {khqrPreview.ok ? (
                                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                                            <PreviewRow
                                                label="Source"
                                                value={khqrPreview.source}
                                            />
                                            <PreviewRow
                                                label="Merchant Type"
                                                value={khqrPreview.decoded?.merchantType === '30' ? 'Merchant' : 'Individual'}
                                            />
                                            <PreviewRow
                                                label="Account ID"
                                                value={khqrPreview.decoded?.bakongAccountID}
                                            />
                                            <PreviewRow
                                                label="Merchant Name"
                                                value={khqrPreview.decoded?.merchantName}
                                            />
                                            <PreviewRow
                                                label="Merchant ID"
                                                value={khqrPreview.decoded?.merchantID}
                                            />
                                            <PreviewRow
                                                label="Acquiring Bank"
                                                value={khqrPreview.decoded?.acquiringBank}
                                            />
                                        </div>
                                    ) : (
                                        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                            {(khqrPreview.errors || ['KHQR configuration is incomplete.']).join(' ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                                    </>
                                );
                            })()}
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={isSavingGateways}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:bg-slate-300"
                    >
                        {isSavingGateways ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                        ) : (
                            <Landmark className="h-4 w-4" />
                        )}
                        Save Payment Methods
                    </button>
                </form>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shrink-0">
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                    <h2 className="flex items-center gap-2 font-bold text-slate-700">
                        <RefreshCw className="h-4 w-4 text-indigo-400" />
                        {t('settings.exchange_rate')}
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">{t('settings.exchange_rate_description')}</p>
                </div>

                <form onSubmit={handleUpdateRate} className="flex flex-col gap-6 p-6">
                    <div>
                        <label className="mb-2 block text-sm font-bold text-slate-700">
                            {t('settings.usd_to_khr')}
                        </label>
                        <div className="relative w-full max-w-xs">
                            <input
                                type="number"
                                min="3000"
                                max="10000"
                                step="10"
                                required
                                value={rate}
                                onChange={e => setRate(e.target.value)}
                                className="block w-full rounded-2xl border-2 border-slate-200 py-3 pl-4 pr-16 text-2xl font-bold transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                <span className="font-bold text-slate-400">{t('common.khr')}</span>
                            </div>
                        </div>
                        <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                            <AlertCircle className="h-3 w-3" />
                            {t('settings.current_rate', { rate: (exchangeRate?.usd_to_khr || 4000).toLocaleString() })}
                        </p>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:bg-slate-300"
                        >
                            {isSubmitting ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                            {t('actions.update_rate')}
                        </button>
                    </div>
                </form>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shrink-0">
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                    <h2 className="flex items-center gap-2 font-bold text-slate-700">
                        <Download className="h-4 w-4 text-emerald-400" />
                        Complete Backup
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">Download a complete copy of your database and images.</p>
                </div>

                <div className="p-6">
                    <p className="mb-4 text-sm leading-relaxed text-slate-600">
                        Press the button below to download your entire POS database and all item images as a .zip file. Store this file on an external drive or cloud storage regularly.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            window.location.href = '/settings/backup';
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 font-bold text-white shadow-sm transition-all hover:bg-emerald-600"
                    >
                        <Download className="h-4 w-4" />
                        Download Backup (.zip)
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shrink-0">
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                    <h2 className="flex items-center gap-2 font-bold text-slate-700">
                        <Upload className="h-4 w-4 text-rose-400" />
                        Restore Complete Backup
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">Upload a .zip backup file to restore your POS database and images.</p>
                </div>

                <div className="p-6">
                    <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                            <div>
                                <strong className="block font-bold">Warning: Overwrites Current Data</strong>
                                Restoring a backup will replace your current database and merge item images with the data from the backup file. A safety copy of your current database will be saved automatically before restoring.
                            </div>
                        </div>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); setShowRestoreWarning(true); }} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-slate-700">Backup File (.zip)</label>
                            <input
                                type="file"
                                accept=".zip"
                                onChange={(e) => setRestoreData('database', e.target.files[0])}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-rose-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-rose-700 hover:file:bg-rose-100"
                            />
                            {restoreErrors.database && (
                                <p className="mt-2 text-sm text-rose-600">{restoreErrors.database}</p>
                            )}
                        </div>

                        {showRestoreWarning ? (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                                <p className="font-bold text-rose-800 mb-3">Are you absolutely sure you want to overwrite your data?</p>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        disabled={isRestoring}
                                        onClick={handleRestore}
                                        className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 font-bold text-white shadow-sm transition-all hover:bg-rose-700 disabled:bg-rose-300"
                                    >
                                        {isRestoring ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                                        ) : (
                                            <AlertTriangle className="h-4 w-4" />
                                        )}
                                        Yes, Restore Now
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isRestoring}
                                        onClick={() => setShowRestoreWarning(false)}
                                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="submit"
                                disabled={!restoreData.database}
                                className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-6 py-3 font-bold text-white shadow-sm transition-all hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                            >
                                <Upload className="h-4 w-4" />
                                Restore Backup
                            </button>
                        )}
                    </form>
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shrink-0">
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                    <h2 className="font-bold text-slate-700">{t('settings.about')}</h2>
                </div>
                <div className="p-6">
                    <dl className="space-y-3 text-sm font-mono">
                        {[
                            [t('settings.application'), 'Mart 2500 POS'],
                            [t('settings.version'), '1.0.0 (Sprint 5 Build)'],
                            [t('settings.database'), 'SQLite (Offline-first)'],
                            [t('settings.currency'), 'KHR (Khmer Riel)'],
                        ].map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                                <dt className="text-slate-400">{key}</dt>
                                <dd className="font-bold text-slate-700">{val}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shrink-0">
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                    <h2 className="font-bold text-slate-700">Offline Readiness</h2>
                    <p className="mt-1 text-xs text-slate-400">
                        These values should stay local for reliable offline and LAN-only use.
                    </p>
                </div>
                <div className="p-6">
                    <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900">
                            Diagnostics Score: {offlineStatus?.offline_score || 0}/{offlineStatus?.offline_total || 0}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            `Pass` means ready. `Warn` means the app can still run, but the setup is weaker for offline/LAN use.
                        </p>
                    </div>

                    <dl className="space-y-3 text-sm">
                        {[
                            ['App URL', offlineStatus?.app_url || 'Not set'],
                            ['Session Driver', offlineStatus?.session_driver || 'Unknown'],
                            ['Cache Store', offlineStatus?.cache_store || 'Unknown'],
                            ['Queue Connection', offlineStatus?.queue_connection || 'Unknown'],
                            [
                                'Public Storage Link',
                                offlineStatus?.public_storage_ready ? 'Ready' : 'Missing',
                            ],
                            [
                                'SQLite Database',
                                offlineStatus?.sqlite_ready ? 'Ready' : 'Missing',
                            ],
                        ].map(([key, val]) => (
                            <div
                                key={key}
                                className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0"
                            >
                                <dt className="text-slate-500">{key}</dt>
                                <dd
                                    className={`font-semibold ${
                                        val === 'Missing'
                                            ? 'text-rose-600'
                                            : val === 'Ready'
                                              ? 'text-emerald-600'
                                              : 'text-slate-700'
                                    }`}
                                >
                                    {val}
                                </dd>
                            </div>
                        ))}
                    </dl>

                    {!offlineStatus?.public_storage_ready && (
                        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            Product images need the Laravel public storage link. Run <code>php artisan storage:link</code> once on the local machine.
                        </p>
                    )}

                    {offlineStatus?.app_url_is_localhost && (
                        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            <code>APP_URL</code> is still using localhost. That is fine for one machine, but other devices on the LAN will need your local server IP instead.
                        </p>
                    )}

                    <div className="mt-5 space-y-3">
                        {(offlineStatus?.diagnostics || []).map((check) => (
                            <div
                                key={check.label}
                                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-semibold text-slate-900">{check.label}</p>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                            check.status === 'pass'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : check.status === 'fail'
                                                  ? 'bg-rose-100 text-rose-700'
                                                  : 'bg-amber-100 text-amber-700'
                                        }`}
                                    >
                                        {check.status}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-slate-600">{check.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shrink-0">
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                    <h2 className="font-bold text-slate-700">Offline Setup Checklist</h2>
                    <p className="mt-1 text-xs text-slate-400">
                        Use this checklist when preparing a shop PC or LAN server.
                    </p>
                </div>
                <div className="space-y-3 p-6 text-sm text-slate-700">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="font-semibold text-slate-900">1. Set a local app URL</p>
                        <p className="mt-1 text-slate-600">
                            In <code>.env</code>, use a LAN-safe value like <code>APP_URL=http://127.0.0.1:8000</code> or your local server IP.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="font-semibold text-slate-900">2. Keep runtime local</p>
                        <p className="mt-1 text-slate-600">
                            Use <code>SESSION_DRIVER=file</code>, <code>CACHE_STORE=file</code>, and <code>QUEUE_CONNECTION=sync</code> for offline operation.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="font-semibold text-slate-900">3. Link public storage</p>
                        <p className="mt-1 text-slate-600">
                            Run <code>php artisan storage:link</code> once so item images work from the local disk.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="font-semibold text-slate-900">4. Back up the application regularly</p>
                        <p className="mt-1 text-slate-600">
                            Use the Complete Backup button above and copy the <code>.zip</code> file to a USB drive or cloud storage.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="font-semibold text-slate-900">5. Test with internet disconnected</p>
                        <p className="mt-1 text-slate-600">
                            Verify login, item images, checkout, receipt printing, invoice viewing, and backup download before going live.
                        </p>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shrink-0">
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                    <h2 className="font-bold text-slate-700">Recovery Guide</h2>
                    <p className="mt-1 text-xs text-slate-400">
                        Use these steps to move or restore the shop on another local machine.
                    </p>
                </div>
                <div className="space-y-3 p-6 text-sm text-slate-700">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="font-semibold text-slate-900">Backup files to keep</p>
                        <p className="mt-1 text-slate-600">
                            Save the downloaded <code>.zip</code> backup and your <code>.env</code> file.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="font-semibold text-slate-900">Restore on a new machine</p>
                        <div className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 text-slate-100">
                            <pre className="text-xs leading-6">
{`1. Copy project files to the new PC
2. Copy your .env file
3. Run: php artisan storage:link
4. Start the local server
5. Go to Settings and upload the .zip file in the Restore section`}
                            </pre>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="font-semibold text-slate-900">LAN access note</p>
                        <p className="mt-1 text-slate-600">
                            If cashiers connect from other devices, set <code>APP_URL</code> to the server IP and open the app through that same local address everywhere.
                        </p>
                    </div>
                </div>
            </div>
        </POSLayout>
    );
}

function PreviewRow({ label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1 break-all font-semibold text-slate-700">{value || 'Not set'}</p>
        </div>
    );
}
