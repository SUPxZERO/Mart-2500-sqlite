import { BakongKHQR, IndividualInfo, MerchantInfo, khqrData } from 'bakong-khqr';

const CURRENCY_MAP = {
    KHR: khqrData.currency.khr,
    USD: khqrData.currency.usd,
};

// Bank code mappings for account ID format conversion
const BANK_CODES = {
    'aclb': 'ACLB',
    'aba': 'ABA',
    'aba bank': 'ABA',
    'nbc': 'NBC',
    'national bank': 'NBC',
    'canadia': 'CANADIA',
    'metfone': 'METFONE',
    'vattanac': 'VATTANAC',
};

function formatDynamicAmount(amountKhr, currencyMode, exchangeRate) {
    if (!amountKhr) {
        return undefined;
    }

    if (currencyMode === 'USD') {
        const usdRate = exchangeRate?.usd_to_khr || 4000;
        return Number((amountKhr / usdRate).toFixed(2));
    }

    return Math.round(amountKhr);
}

function normalizeString(value) {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).trim();
}

/**
 * Smart account ID formatter - converts various input formats to username@bankcode
 * @param {string} accountId - Raw account ID input (can be: username@bank, username, phone, etc.)
 * @param {string} bankCode - Optional bank code (e.g., 'aclb', 'aba')
 * @returns {string} - Formatted account ID as username@bankcode
 */
function formatBakongAccountId(accountId, bankCode = '') {
    const normalized = normalizeString(accountId);
    const bank = normalizeString(bankCode).toLowerCase();
    
    if (!normalized) {
        return '';
    }

    // If already in correct format (contains @), return as-is
    if (normalized.includes('@')) {
        console.log('🔑 Account ID already in correct format:', normalized);
        return normalized;
    }

    // If bank code provided, append it
    if (bank && BANK_CODES[bank]) {
        const formattedBank = BANK_CODES[bank].toLowerCase();
        const formatted = `${normalized}@${formattedBank}`;
        console.log('🔑 Account ID formatted with bank code:', formatted);
        return formatted;
    }

    // If no bank code, return as-is and let Bakong lib handle it
    console.log('⚠️ Account ID format:', normalized, '(no bank code provided)');
    return normalized;
}

function normalizeKhqrError(error) {
    const message = error?.message || String(error);

    // Log full error for debugging
    console.error('🔴 KHQR Error Details:', {
        message,
        name: error?.name,
        code: error?.code,
        fullError: error,
    });

    // Bakong-specific error messages
    if (message.includes('Account not found') || message.includes('account') || message.toLowerCase().includes('accountid')) {
        return 'Account ID not found at Bakong. Please verify the account exists and is active. Format should be: username@bankcode (e.g., sokang_seng@aclb)';
    }

    if (message.includes('TIMEOUT') || message.includes('timeout')) {
        return 'Connection timeout contacting Bakong server. Try again or use Uploaded Mode with your bank KHQR payload instead.';
    }

    if (message.includes('CONNECTION') || message.includes('connection')) {
        return 'Connection failed to Bakong server. This is usually temporary. Try again in a moment or use Uploaded Mode.';
    }

    if (message.includes('slice is not a function')) {
        return 'Input is not a valid raw QR payload. Paste the full text starting with 000201, not an image or screenshot.';
    }

    if (message.includes('Invalid') || message.includes('invalid')) {
        return 'Invalid format or data. Check account ID format (username@bankcode) and required fields.';
    }

    return message;
}

function buildOptionalData(gateway, amountKhr, exchangeRate) {
    const optionalData = {
        currency: CURRENCY_MAP[gateway.currency_mode] || khqrData.currency.khr,
        accountInformation: normalizeString(gateway.account_information) || undefined,
        acquiringBank: normalizeString(gateway.acquiring_bank) || undefined,
        mobileNumber: normalizeString(gateway.phone_number) || undefined,
        billNumber: normalizeString(gateway.bill_number_prefix) || undefined,
        storeLabel: normalizeString(gateway.store_label) || undefined,
        terminalLabel: normalizeString(gateway.terminal_label) || undefined,
        purposeOfTransaction:
            normalizeString(gateway.purpose_of_transaction) || undefined,
        merchantCategoryCode:
            normalizeString(gateway.merchant_category_code) || '5999',
    };

    if (gateway.is_dynamic) {
        optionalData.amount = formatDynamicAmount(
            amountKhr,
            gateway.currency_mode,
            exchangeRate,
        );

        if (gateway.expiration_minutes) {
            optionalData.expirationTimestamp =
                Date.now() + gateway.expiration_minutes * 60 * 1000;
        }
    }

    return optionalData;
}

export function inspectKhqrPayload(payload) {
    const trimmedPayload = normalizeString(payload);

    if (!trimmedPayload) {
        return {
            ok: false,
            errors: ['No KHQR payload found.'],
        };
    }

    if (!trimmedPayload.startsWith('000201')) {
        return {
            ok: false,
            errors: [
                'KHQR payload must be raw text that starts with 000201. Do not paste a QR image, screenshot, or payment link.',
            ],
        };
    }

    return {
        ok: true,
        payload: trimmedPayload,
        decoded: null,
        source: 'uploaded_payload',
    };
}

export function buildGatewayKhqr(gateway, { amountKhr = null, exchangeRate = null } = {}) {
    if (!gateway?.supports_khqr) {
        return {
            ok: false,
            errors: ['KHQR preview is disabled for this provider.'],
        };
    }

    // Mode 1: Uploaded payload (from bank app/portal)
    if (gateway.qr_mode === 'uploaded_payload') {
        console.log('📤 Using uploaded KHQR payload mode');
        return inspectKhqrPayload(gateway.khqr_payload);
    }

    const merchantName =
        normalizeString(gateway.account_name) ||
        normalizeString(gateway.display_name) ||
        'Merchant';
    const merchantCity = normalizeString(gateway.merchant_city) || 'Phnom Penh';
    
    // Format account ID - accepts multiple formats and converts to username@bankcode
    const rawAccountId = normalizeString(gateway.bakong_account_id) ||
                        normalizeString(gateway.bakong_id);
    const bankCode = normalizeString(gateway.acquiring_bank) || '';
    const bakongAccountId = formatBakongAccountId(rawAccountId, bankCode);

    if (!bakongAccountId) {
        return {
            ok: false,
            errors: ['Bakong Account ID is required for generated KHQR.'],
        };
    }

    try {
        const khqr = new BakongKHQR();
        let response;

        console.log('🔄 Building KHQR...', {
            mode: gateway.qr_mode,
            accountId: bakongAccountId,
            merchantName,
            merchantCity,
            isDynamic: gateway.is_dynamic,
        });

        // Mode 2: Generated merchant KHQR
        if (gateway.qr_mode === 'generated_merchant') {
            const merchantId = normalizeString(gateway.merchant_id);
            const acquiringBank = normalizeString(gateway.acquiring_bank);

            if (!merchantId || !acquiringBank) {
                return {
                    ok: false,
                    errors: [
                        'Merchant KHQR requires both Merchant ID and Acquiring Bank.',
                    ],
                };
            }

            const merchantInfo = new MerchantInfo(
                bakongAccountId,
                merchantName,
                merchantCity,
                merchantId,
                acquiringBank,
                buildOptionalData(gateway, amountKhr, exchangeRate),
            );

            response = khqr.generateMerchant(merchantInfo);
            console.log('🏪 Merchant mode response:', response?.status?.code);
        } 
        // Mode 3: Generated individual KHQR
        else {
            const optionalData = buildOptionalData(gateway, amountKhr, exchangeRate);
            const individualInfo = new IndividualInfo(
                bakongAccountId,
                merchantName,
                merchantCity,
                optionalData,
            );

            response = khqr.generateIndividual(individualInfo);
            console.log('👤 Individual mode response:', response?.status?.code);
        }

        // Check for success
        if (response?.status?.code !== 0 || !response?.data?.qr) {
            const errorMsg = response?.status?.message || 'Failed to generate KHQR.';
            console.error('❌ KHQR generation failed:', errorMsg);
            
            return {
                ok: false,
                errors: [errorMsg],
            };
        }

        // Decode and return successful QR
        const decoded = BakongKHQR.decode(response.data.qr);
        console.log('✅ KHQR generated successfully');

        return {
            ok: true,
            payload: response.data.qr,
            decoded: decoded?.data || null,
            source: gateway.qr_mode,
        };
    } catch (error) {
        const errorMsg = normalizeKhqrError(error);
        console.error('❌ KHQR generation error:', errorMsg);
        
        return {
            ok: false,
            errors: [errorMsg],
        };
    }
}
