const messages = {
    app: {
        brand: 'Mart 2500',
        mobile_workspace: 'Retail workspace',
        retail_os: 'Retail OS',
        sidebar_tagline:
            'Checkout, customers, reporting, and settings in one place.',
        best_pos: "Cambodia's Best POS",
    },
    actions: {
        open_navigation: 'Open navigation',
        close_navigation: 'Close navigation',
        close_navigation_backdrop: 'Close navigation backdrop',
        clear_search: 'Clear search',
        clear_all: 'Clear All',
        view_receipt: 'View Receipt',
        print_receipt_copy: 'Print Receipt Copy',
        confirm_order: 'Confirm Order',
        update_rate: 'Update Rate',
        download_backup: 'Download Backup (.sqlite)',
    },
    nav: {
        checkout: 'Checkout',
        checkout_description: 'Sell items and complete orders',
        invoices: 'Invoices',
        invoices_description: 'Review receipts and transactions',
        customers: 'Customers',
        customers_description: 'Track debt and customer history',
        dashboard: 'Dashboard',
        dashboard_description: 'Monitor store performance',
        settings: 'Settings',
        settings_description: 'Manage rate and backups',
    },
    pos: {
        workspace_title: 'Checkout Workspace',
        workspace_description:
            'Search the catalog, build a cart, and complete a sale without leaving the current screen.',
        page_title: 'Checkout - Mart 2500',
        search_items_placeholder: 'Search items by name...',
        current_order: 'Current Order',
        cart_empty: 'Cart is empty',
        cart_empty_hint: 'Click items on the left to add',
        customer: 'Customer',
        walk_in_customer: 'Walk-in Customer',
        total: 'Total',
        checkout_pay: 'Checkout Pay',
        checkout: 'Checkout',
        checkout_description:
            'Select payment method to complete the order.',
        total_due: 'Total Due',
        cash: 'Cash',
        aba_bank_transfer: 'ABA Bank Transfer',
        khqr: 'KHQR',
        store_credit_debt: 'Store Credit (Debt)',
        add_to_balance: 'Add to Balance',
        standard_checkout: 'Standard checkout',
        select_customer: 'Select Customer',
        search_customer_placeholder: 'Search by name or phone...',
        no_phone: 'No Phone',
        owes: 'Owes',
        credit: 'Credit',
        customer_search_empty: 'No customers found matching "{searchQuery}"',
        customer_add_to_balance: "Add to {name}'s balance",
        customer_not_available_walk_in: 'Not available for Walk-ins',
        cash_received: 'Cash Received (KHR)',
        insufficient_cash: 'Cannot proceed: Insufficient cash received.',
        insufficient_amount: 'Insufficient Amount',
        change_due: 'Change Due',
        scan_khqr: 'Scan KHQR',
        khqr_description:
            'Customer must scan this QR code with their banking app to transfer exactly {total} KHR.',
        payload: 'Payload:',
        debt_increase_message:
            "{name}'s debt will increase by {total} KHR.",
        checkout_failed: 'Checkout failed:',
        failed_complete_transaction: 'Failed to complete transaction.',
    },
    dashboard: {
        title: 'Dashboard & Reporting',
        description:
            'Live overview of store performance, revenue, top items, and debt exposure.',
        page_title: 'Dashboard',
        today_performance: "Today's Performance",
        revenue_completed: 'Revenue (Completed)',
        transactions: 'Transactions',
        debt_added_today: 'Debt Added Today',
        payments_collected: 'Payments Collected',
        revenue_trend: '7-Day Revenue Trend',
        revenue_trend_description: 'Completed orders in KHR',
        revenue: 'Revenue',
        payment_methods: 'Payment Methods',
        payment_methods_description: 'All-time breakdown',
        no_data_yet: 'No data yet',
        top_items: 'Top 5 Items by Revenue',
        top_items_description: 'All-time total',
        sold_count: '{count} sold',
        no_sales_data_yet: 'No sales data yet',
        debt_summary: 'Outstanding Debt Summary',
        debt_summary_description: 'All customers with unpaid balance',
        total_owed: 'Total Owed',
        customers_in_debt: 'Customers in Debt',
    },
    customers: {
        title: 'Customers & Debt Management',
        description:
            'Search customer profiles, review balances, and drill into lifetime value and debt history.',
        page_title: 'Customer Management',
        search_placeholder: 'Search name or phone... (Press Enter)',
        table_customer: 'Customer',
        table_contact: 'Contact',
        table_lifetime_value: 'Lifetime Value',
        table_debt_balance: 'Debt Balance',
        table_action: 'Action',
        settled: 'Settled',
        no_customers_found: 'No customers found.',
        no_phone_number: 'No phone number',
        back_to_customers: 'Back to Customers',
        lifetime_spent: 'Lifetime Spent',
        currently_owes: 'Currently Owes',
        store_credit: 'Store Credit',
        detail_page_title: 'Customer: {name}',
        transaction_timeline: 'Transaction Timeline',
        receive_debt_payment: 'Receive Debt Payment',
        no_transactions:
            'No transactions recorded for this customer yet.',
        purchase: 'Purchase',
        payment_received: 'Payment Received',
        via_method: 'via {method}',
        added_to_debt: 'Added to Debt',
    },
    invoices: {
        title: 'Invoice History',
        description:
            'Review past transactions, inspect receipt details, and track payment methods.',
        page_title: 'Invoice History',
        invoice_number: 'Invoice #',
        date: 'Date',
        customer: 'Customer',
        total_khr: 'Total (KHR)',
        status_method: 'Status & Method',
        action: 'Action',
        walk_in_customer: 'Walk-in Customer',
        paid_method: 'Paid {method}',
        store_credit: 'Store Credit',
        no_invoices_found: 'No invoices found.',
        no_invoices_hint: 'Complete a checkout in the POS to see it here.',
        showing_invoices: 'Showing {count} of {total} invoices',
        invoice_not_found: 'Invoice not found.',
        item: 'Item',
        qty: 'Qty',
        ext: 'Ext',
        customer_label: 'Customer:',
        total_label: 'TOTAL KHR',
        paid_by: 'PAID BY {method}',
    },
    settings: {
        title: 'Settings',
        description:
            'Configure exchange rate, download backups, and review system metadata.',
        page_title: 'Settings',
        exchange_rate: 'Exchange Rate',
        exchange_rate_description:
            'Used to display USD equivalent prices in the checkout flow.',
        usd_to_khr: '1 USD = ? KHR',
        current_rate: 'Current rate: 1 USD = {rate} KHR',
        database_backup: 'Database Backup',
        database_backup_description:
            'Download a complete copy of your SQLite database file for off-site backup.',
        database_backup_copy:
            'Press the button below to download your entire POS database as a .sqlite file. Store this file on an external drive or cloud storage regularly.',
        about: 'About Mart 2500',
        application: 'Application',
        version: 'Version',
        database: 'Database',
        currency: 'Currency',
    },
    common: {
        khr: 'KHR',
    },
    auth: {
        dashboard: 'Dashboard',
        profile: 'Profile',
        log_out: 'Log Out',
        logged_in: "You're logged in!",
        log_in: 'Log in',
        email: 'Email',
        password: 'Password',
        remember_me: 'Remember me',
        forgot_password: 'Forgot your password?',
        register: 'Register',
        name: 'Name',
        confirm_password: 'Confirm Password',
        already_registered: 'Already registered?',
        forgot_password_title: 'Forgot Password',
        forgot_password_intro:
            'Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.',
        email_reset_link: 'Email Password Reset Link',
        reset_password: 'Reset Password',
        confirm_password_title: 'Confirm Password',
        confirm_password_intro:
            'This is a secure area of the application. Please confirm your password before continuing.',
        confirm: 'Confirm',
        email_verification: 'Email Verification',
        verify_email_intro:
            "Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you? If you didn't receive the email, we will gladly send you another.",
        verification_link_sent:
            'A new verification link has been sent to the email address you provided during registration.',
        resend_verification_email: 'Resend Verification Email',
    },
    profile: {
        title: 'Profile',
        profile_information: 'Profile Information',
        update_profile_copy:
            "Update your account's profile information and email address.",
        unverified_email: 'Your email address is unverified.',
        resend_verification_email:
            'Click here to re-send the verification email.',
        verification_link_sent:
            'A new verification link has been sent to your email address.',
        save: 'Save',
        saved: 'Saved.',
        update_password: 'Update Password',
        update_password_copy:
            'Ensure your account is using a long, random password to stay secure.',
        current_password: 'Current Password',
        new_password: 'New Password',
        delete_account: 'Delete Account',
        delete_account_copy:
            'Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.',
        confirm_delete_title:
            'Are you sure you want to delete your account?',
        confirm_delete_copy:
            'Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.',
        cancel: 'Cancel',
    },
};

function getNestedValue(object, key) {
    return key.split('.').reduce((value, segment) => value?.[segment], object);
}

export function t(key, replacements = {}) {
    const template = getNestedValue(messages, key);

    if (typeof template !== 'string') {
        return key;
    }

    return Object.entries(replacements).reduce(
        (value, [replacementKey, replacementValue]) =>
            value.replaceAll(`{${replacementKey}}`, replacementValue),
        template,
    );
}

export const translations = messages;
