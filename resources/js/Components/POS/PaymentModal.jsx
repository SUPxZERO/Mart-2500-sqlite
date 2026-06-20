import { useEffect, useMemo, useState } from 'react';
import { t } from '@/i18n';
import { X, Banknote, Landmark, UserX, QrCode, ChevronDown, ChevronUp } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { QRCodeSVG } from 'qrcode.react';
import { buildGatewayKhqr } from '@/utils/khqr';

export default function PaymentModal({
    isOpen,
    onClose,
    onConfirm,
    exchangeRate,
    paymentGateways = [],
}) {
    // Use selective subscriptions instead of destructuring all at once
    const getCartTotal = useCartStore((state) => state.getCartTotal);
    const selectedCustomer = useCartStore((state) => state.selectedCustomer);
    const cart = useCartStore((state) => state.cart);
    
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [selectedGatewayCode, setSelectedGatewayCode] = useState('');
    const [cashReceived, setCashReceived] = useState('');
    const [cashCurrency, setCashCurrency] = useState('KHR');
    const [showGatewayDetails, setShowGatewayDetails] = useState(false);
    const usdToKhr = exchangeRate?.usd_to_khr || 4000;

    const configuredGateways = useMemo(
        () => paymentGateways.filter((gateway) => gateway.enabled),
        [paymentGateways],
    );

    const selectedGateway = useMemo(
        () =>
            configuredGateways.find(
                (gateway) => gateway.code === selectedGatewayCode,
            ) || null,
        [configuredGateways, selectedGatewayCode],
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setPaymentMethod('Cash');
        setCashReceived('');
        setCashCurrency('KHR');
        setSelectedGatewayCode(configuredGateways[0]?.code || '');
        setShowGatewayDetails(false);
    }, [isOpen, configuredGateways]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    // Memoize total calculation - recalculates when cart changes
    const total = useMemo(() => {
        if (cart.length === 0) return 0;
        return cart.reduce((sum, item) => {
            const price = item.custom_price_sold_at || item.default_price || 0;
            const qty = item.qty || 0;
            return sum + (price * qty);
        }, 0);
    }, [cart]);
    const formatMoney = (amount) => new Intl.NumberFormat('en-US').format(amount);
    const formatUsd = (amount) =>
        new Intl.NumberFormat('en-US', {
            minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        }).format(amount);

    const receivedInput = parseFloat(cashReceived) || 0;
    const receivedKhr =
        cashCurrency === 'USD'
            ? Math.round(receivedInput * usdToKhr)
            : Math.round(receivedInput);
    const change = receivedKhr - total;
    const totalUsd = total / usdToKhr;
    const canUseCredit = selectedCustomer !== null;
    const canConfirmProviderPayment =
        paymentMethod === 'Provider' ? !!selectedGateway : true;

    const providerLabel = selectedGateway?.display_name || 'Payment Provider';
    const khqrPreview = useMemo(
        () =>
            selectedGateway
                ? buildGatewayKhqr({ ...selectedGateway, is_dynamic: true }, {
                      amountKhr: total,
                      exchangeRate,
                  })
                : null,
        [selectedGateway, total, exchangeRate],
    );
    const khqrPayload = khqrPreview?.payload || '';

    if (!isOpen || cart.length === 0) return null;

    const handleConfirm = () => {
        if (paymentMethod === 'Cash' && receivedKhr < total) {
            alert(t('pos.insufficient_cash'));
            return;
        }

        if (paymentMethod === 'Provider' && !selectedGateway) {
            return;
        }

        onConfirm({
            method: paymentMethod === 'Provider' ? 'Bank_Transfer' : paymentMethod,
            provider: paymentMethod === 'Provider' ? selectedGateway : null,
            received_khr: paymentMethod === 'Cash' ? receivedKhr : total,
            change_khr: paymentMethod === 'Cash' ? Math.max(0, change) : 0,
            status:
                paymentMethod === 'Unpaid_Debt' ? 'Added_To_Debt' : 'Completed',
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex w-[45%] flex-col border-r border-slate-100 bg-slate-50">
                    <div className="border-b border-slate-100 p-6">
                        <h3 className="text-xl font-bold text-slate-800">
                            {t('pos.checkout')}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {t('pos.checkout_description')}
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="mb-6 rounded-2xl border border-emerald-100 bg-white p-6 text-center shadow-sm shadow-emerald-500/10">
                            <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-slate-500">
                                {t('pos.total_due')}
                            </p>
                            <p className="text-4xl font-black text-emerald-600">
                                {formatMoney(total)} <span className="text-lg">KHR</span>
                            </p>
                        </div>

                        <div className="space-y-3">
                            <PaymentOption
                                icon={<Banknote />}
                                title={t('pos.cash')}
                                subtitle="Take cash and calculate change."
                                active={paymentMethod === 'Cash'}
                                onClick={() => setPaymentMethod('Cash')}
                            />

                            {configuredGateways.length > 0 && (
                                <PaymentOption
                                    icon={<Landmark />}
                                    title="Bank / App Payment"
                                    subtitle="Show local payment details and confirm manually after transfer."
                                    active={paymentMethod === 'Provider'}
                                    onClick={() => setPaymentMethod('Provider')}
                                />
                            )}

                            <button
                                onClick={() => canUseCredit && setPaymentMethod('Unpaid_Debt')}
                                disabled={!canUseCredit}
                                className={`w-full overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                                    paymentMethod === 'Unpaid_Debt'
                                        ? 'border-rose-500 bg-rose-50/50'
                                        : canUseCredit
                                          ? 'border-slate-100 bg-white hover:border-slate-300'
                                          : 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-60'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`shrink-0 rounded-full p-3 ${
                                            paymentMethod === 'Unpaid_Debt'
                                                ? 'bg-rose-500 text-white'
                                                : 'bg-slate-100 text-slate-500'
                                        }`}
                                    >
                                        <UserX className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4
                                            className={`text-lg font-bold ${
                                                paymentMethod === 'Unpaid_Debt'
                                                    ? 'text-rose-700'
                                                    : 'text-slate-700'
                                            }`}
                                        >
                                            {t('pos.store_credit_debt')}
                                        </h4>
                                        <p className="line-clamp-1 text-sm text-slate-500">
                                            {canUseCredit
                                                ? t('pos.customer_add_to_balance', {
                                                      name: selectedCustomer.name,
                                                  })
                                                : t('pos.customer_not_available_walk_in')}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex w-[60%] min-h-0 flex-col bg-white">
                    <div className="flex justify-end p-4">
                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-500"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-8 pb-8">
                        {paymentMethod === 'Cash' && (
                            <div className="animate-in slide-in-from-right-4 space-y-6 duration-300">
                                <div>
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <label className="block text-sm font-bold text-slate-700">
                                            Cash Received ({cashCurrency})
                                        </label>
                                        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                                            {['KHR', 'USD'].map((currency) => (
                                                <button
                                                    key={currency}
                                                    type="button"
                                                    onClick={() => setCashCurrency(currency)}
                                                    className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                                                        cashCurrency === currency
                                                            ? 'bg-white text-emerald-600 shadow-sm'
                                                            : 'text-slate-500 hover:text-slate-700'
                                                    }`}
                                                >
                                                    {currency}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            autoFocus
                                            value={cashReceived}
                                            onChange={(e) => setCashReceived(e.target.value)}
                                            className="block w-full rounded-xl border-2 border-slate-200 py-4 pl-4 pr-16 text-3xl font-bold transition-colors focus:border-emerald-500 focus:outline-none focus:ring-0"
                                            placeholder="0"
                                            min="0"
                                            step={cashCurrency === 'USD' ? '0.01' : '1'}
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                            <span className="text-xl font-bold text-slate-400">
                                                {cashCurrency}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                                        <p className="font-semibold text-slate-600">
                                            {t('settings.current_rate', {
                                                rate: formatMoney(usdToKhr),
                                            })}
                                        </p>
                                        {cashCurrency === 'USD' && receivedInput > 0 && (
                                            <p className="mt-1 text-slate-500">
                                                Equivalent: {formatMoney(receivedKhr)} KHR
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        {(cashCurrency === 'USD'
                                            ? [totalUsd, 5, 10, 20, 50, 100]
                                            : [total, 10000, 20000, 50000, 100000]
                                        )
                                            .filter(
                                                (val, i, arr) =>
                                                    val >=
                                                        (cashCurrency === 'USD'
                                                            ? totalUsd
                                                            : total) && arr.indexOf(val) === i,
                                            )
                                            .map((amount) => (
                                                <button
                                                    key={amount}
                                                    type="button"
                                                    onClick={() =>
                                                        setCashReceived(
                                                            cashCurrency === 'USD'
                                                                ? amount.toFixed(2)
                                                                : amount.toString(),
                                                        )
                                                    }
                                                    className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200"
                                                >
                                                    {cashCurrency === 'USD'
                                                        ? formatUsd(amount)
                                                        : formatMoney(amount)}
                                                </button>
                                            ))}
                                    </div>
                                </div>

                                {receivedInput > 0 && (
                                    <div
                                        className={`rounded-xl border p-6 ${
                                            change < 0
                                                ? 'border-rose-100 bg-rose-50'
                                                : 'border-slate-200 bg-slate-50'
                                        }`}
                                    >
                                        <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-slate-500">
                                            {change < 0
                                                ? t('pos.insufficient_amount')
                                                : t('pos.change_due')}
                                        </p>
                                        <p
                                            className={`text-4xl font-black ${
                                                change < 0
                                                    ? 'text-rose-600'
                                                    : 'text-slate-800'
                                            }`}
                                        >
                                            {formatMoney(Math.abs(change))}{' '}
                                            <span className="text-lg">KHR</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {paymentMethod === 'Provider' && (
                            <div className="animate-in zoom-in-95 flex min-h-0 flex-1 flex-col space-y-5 duration-300">
                                <div>
                                    <p className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
                                        Choose Provider
                                    </p>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {configuredGateways.map((gateway) => (
                                            <button
                                                key={gateway.code}
                                                type="button"
                                                onClick={() => setSelectedGatewayCode(gateway.code)}
                                                className={`rounded-2xl border p-4 text-left transition-colors ${
                                                    selectedGatewayCode === gateway.code
                                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                                }`}
                                            >
                                                <p className="font-bold">{gateway.display_name}</p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {gateway.account_number ||
                                                        gateway.phone_number ||
                                                        gateway.bakong_id ||
                                                        'Configure in settings'}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedGateway && (
                                    <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                        <div className="mb-4 flex items-start justify-between gap-4">
                                            <div>
                                                <h4 className="text-xl font-bold text-slate-800">
                                                    {selectedGateway.display_name}
                                                </h4>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Scan the QR below to pay {formatMoney(total)} KHR, then confirm payment.
                                                </p>
                                            </div>
                                            <div className="rounded-full bg-indigo-100 p-3 text-indigo-600">
                                                <Landmark className="h-5 w-5" />
                                            </div>
                                        </div>

                                        {selectedGateway.supports_khqr && khqrPreview?.ok && khqrPayload && (
                                            <div className="flex min-h-0 flex-1 flex-col rounded-2xl bg-white p-4 text-center">
                                                <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                                                        Amount
                                                    </p>
                                                    <p className="mt-1 text-2xl font-black text-emerald-600">
                                                        {formatMoney(total)} KHR
                                                    </p>
                                                    {selectedGateway.currency_mode === 'USD' && (
                                                        <p className="mt-1 text-sm text-emerald-700">
                                                            {formatUsd(totalUsd)} USD
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex min-h-96 flex-1 items-center justify-center rounded-2xl border border-slate-100 p-6 shadow-sm">
                                                    <QRCodeSVG
                                                        value={khqrPayload}
                                                        size={320}
                                                        level="M"
                                                        includeMargin={false}
                                                        imageSettings={{
                                                            src: '/favicon.ico',
                                                            height: 52,
                                                            width: 52,
                                                            excavate: true,
                                                        }}
                                                    />
                                                </div>

                                                <div className="mt-4">
                                                    <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                                                        <QrCode className="h-3.5 w-3.5" />
                                                        KHQR
                                                    </div>
                                                    <p className="text-sm text-slate-500">
                                                        This QR is {khqrPreview.source === 'uploaded_payload' ? 'loaded from the saved bank KHQR payload' : 'generated locally from the KHQR configuration'} for {providerLabel}.
                                                    </p>
                                                    {khqrPreview.decoded?.transactionAmount && (
                                                        <p className="mt-1 text-xs text-slate-400">
                                                            Encoded amount: {khqrPreview.decoded.transactionAmount}{' '}
                                                            {selectedGateway.currency_mode || 'KHR'}
                                                        </p>
                                                    )}
                                                </div>

                                                {selectedGateway.instructions && (
                                                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-600">
                                                        {selectedGateway.instructions}
                                                    </div>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => setShowGatewayDetails((current) => !current)}
                                                    className="mt-4 inline-flex items-center justify-center gap-2 self-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-800"
                                                >
                                                    {showGatewayDetails ? (
                                                        <>
                                                            <ChevronUp className="h-4 w-4" />
                                                            Hide Bank Details
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ChevronDown className="h-4 w-4" />
                                                            Show Bank Details
                                                        </>
                                                    )}
                                                </button>

                                                {showGatewayDetails && (
                                                    <div className="mt-4 grid gap-3 text-left text-sm md:grid-cols-2">
                                                        <InfoRow
                                                            label="Account Name"
                                                            value={selectedGateway.account_name}
                                                        />
                                                        <InfoRow
                                                            label="Account Number"
                                                            value={selectedGateway.account_number}
                                                        />
                                                        <InfoRow
                                                            label="Phone Number"
                                                            value={selectedGateway.phone_number}
                                                        />
                                                        <InfoRow
                                                            label="Merchant ID"
                                                            value={selectedGateway.merchant_id}
                                                        />
                                                        <InfoRow
                                                            label="Bakong Account ID"
                                                            value={
                                                                selectedGateway.bakong_account_id ||
                                                                selectedGateway.bakong_id
                                                            }
                                                        />
                                                        <InfoRow
                                                            label="Acquiring Bank"
                                                            value={selectedGateway.acquiring_bank}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {selectedGateway.supports_khqr && !khqrPreview?.ok && (
                                            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                                {(khqrPreview?.errors || [
                                                    `KHQR is not ready for ${providerLabel}. Complete the KHQR setup in Settings first.`,
                                                ]).join(' ')}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {paymentMethod === 'Unpaid_Debt' && (
                            <div className="animate-in zoom-in-95 flex flex-col items-center justify-center space-y-6 py-12 text-center duration-300">
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-rose-100 text-rose-500 shadow-inner">
                                    <UserX className="h-12 w-12" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-bold text-rose-700">
                                        {t('pos.add_to_balance')}
                                    </h4>
                                    <p className="mt-2 text-lg text-slate-600">
                                        {t('pos.debt_increase_message', {
                                            name: selectedCustomer?.name,
                                            total: formatMoney(total),
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="mt-auto pt-6">
                            <button
                                onClick={handleConfirm}
                                disabled={
                                    !paymentMethod ||
                                    !canConfirmProviderPayment ||
                                    (paymentMethod === 'Cash' && receivedKhr < total)
                                }
                                className={`w-full rounded-xl py-5 text-xl font-bold shadow-lg transition-all ${
                                    paymentMethod === 'Unpaid_Debt'
                                        ? 'bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600'
                                        : !paymentMethod ||
                                            !canConfirmProviderPayment ||
                                            (paymentMethod === 'Cash' && receivedKhr < total)
                                          ? 'cursor-not-allowed bg-slate-300 text-slate-500 shadow-none'
                                          : 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600 active:scale-[0.98]'
                                }`}
                            >
                                {paymentMethod === 'Provider' && selectedGateway
                                    ? `Confirm ${selectedGateway.display_name} Payment`
                                    : t('actions.confirm_order')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PaymentOption({ icon, title, subtitle, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`relative w-full overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                active
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm shadow-emerald-500/10'
                    : 'border-slate-100 bg-white hover:border-slate-300'
            }`}
        >
            <div className="flex items-center gap-4">
                <div
                    className={`shrink-0 rounded-full p-3 transition-colors ${
                        active
                            ? 'bg-emerald-500 text-white shadow-inner'
                            : 'bg-slate-100 text-slate-500'
                    }`}
                >
                    {icon}
                </div>
                <div>
                    <h4
                        className={`text-lg font-bold ${
                            active ? 'text-emerald-700' : 'text-slate-700'
                        }`}
                    >
                        {title}
                    </h4>
                    {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
                </div>
            </div>
        </button>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {label}
            </p>
            <p className="mt-1 break-all font-semibold text-slate-700">
                {value || 'Not set'}
            </p>
        </div>
    );
}
