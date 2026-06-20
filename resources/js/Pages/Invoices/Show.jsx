import { Head, Link } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { t } from '@/i18n';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import POSLayout from '@/Layouts/POSLayout';
import { exportInvoicePdf } from '@/utils/exportInvoicePdf';

export default function InvoiceShow({ invoice }) {
    const invoiceRef = useRef(null);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [pdfError, setPdfError] = useState(null);
    const [imageErrors, setImageErrors] = useState({});
    const formatMoney = (amount) => new Intl.NumberFormat('en-US').format(amount);
    
    const handleImageError = (itemId) => {
        setImageErrors(prev => ({ ...prev, [itemId]: true }));
    };
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };
    const paymentLabel = (invoice.payment_provider || invoice.payment_method || '').replace('_', ' ');

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = async () => {
        if (!invoiceRef.current || isDownloadingPdf) {
            return;
        }

        setIsDownloadingPdf(true);
        setPdfError(null); // Clear previous errors

        try {
            console.log('📥 Starting PDF download for invoice:', invoice.invoice_number);
            await exportInvoicePdf(
                invoiceRef.current,
                `INV-${invoice.invoice_number}.pdf`,
            );
            console.log('✅ PDF downloaded successfully');
        } catch (error) {
            const errorMsg = error?.message || 'Unknown error occurred';
            console.error('❌ PDF download failed:', errorMsg);
            setPdfError(errorMsg);
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    return (
        <POSLayout
            title={t('invoices.title')}
            description={`Invoice #${invoice.invoice_number}`}
            contentClassName="print:p-0 print:m-0 print:bg-white print:block overflow-auto container mx-auto px-4 py-8"
        >
            <Head title={`Invoice #${invoice.invoice_number}`} />

            {/* Print & Export Controls (Hidden when printing) */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
                <Link 
                    href="/invoices" 
                    className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Invoices
                </Link>
                
                {/* Error Message */}
                {pdfError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex-1">
                        <p className="font-bold">❌ PDF Error</p>
                        <p className="text-xs mt-1">{pdfError}</p>
                        <button
                            onClick={() => setPdfError(null)}
                            className="mt-2 text-xs font-bold text-red-600 hover:text-red-800 underline"
                        >
                            Dismiss
                        </button>
                    </div>
                )}
                
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={handleDownloadPdf}
                        disabled={isDownloadingPdf}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 font-bold text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Download className="h-5 w-5" />
                        {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}
                    </button>
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-bold text-white shadow-md transition-colors hover:bg-indigo-700"
                    >
                        <Printer className="h-5 w-5" />
                        Print / PDF
                    </button>
                </div>
            </div>

            {/* A4 Document Area */}
            <div ref={invoiceRef} id="invoice-paper" className="mx-auto max-w-4xl bg-white shadow-xl rounded-sm print:shadow-none print:w-full print:max-w-none print:p-0 print:m-0 print:rounded-none print:bg-white">
                <div className="p-10 sm:p-16">
                    
                    {/* Invoice Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-12">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">MART 2500</h1>
                            <p className="text-slate-500 max-w-xs">{t('app.best_pos')} - The ultimate retail management system</p>
                            <p className="text-slate-500 mt-2">123 Retail Avenue, Phnom Penh, Cambodia</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <h2 className="text-3xl font-light text-slate-400 uppercase tracking-widest mb-4">Invoice</h2>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <span className="font-bold text-slate-500">Invoice No.</span>
                                <span className="font-mono font-medium text-slate-900">{invoice.invoice_number}</span>
                                
                                <span className="font-bold text-slate-500">Date</span>
                                <span className="text-slate-900">{formatDate(invoice.created_at)}</span>
                                
                                <span className="font-bold text-slate-500">Status</span>
                                <span className="text-emerald-600 font-bold uppercase">{invoice.status?.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Block */}
                    <div className="mb-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Billed To</h3>
                        {invoice.customer ? (
                            <div>
                                <p className="text-xl font-bold text-slate-800 mb-1">{invoice.customer.name}</p>
                                <p className="text-slate-500 flex items-center gap-2">
                                    <span title="Phone">📞</span> {invoice.customer.phone_number || 'No phone provided'}
                                </p>
                            </div>
                        ) : (
                            <p className="text-lg font-medium text-slate-600 italic">Walk-in Customer</p>
                        )}
                    </div>

                    {/* Items Table */}
                    <div className="mb-8 overflow-hidden rounded-xl border border-slate-200">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-slate-600">Item</th>
                                    <th className="px-6 py-4 font-bold text-slate-600 text-center">Qty</th>
                                    <th className="px-6 py-4 font-bold text-slate-600 text-right">Unit Price</th>
                                    <th className="px-6 py-4 font-bold text-slate-600 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoice.items?.map((item, idx) => (
                                    <tr key={item.id || idx}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {item.image_url && !imageErrors[item.id] ? (
                                                    <img src={item.image_url} alt={item.item_name} className="w-12 h-12 rounded-lg object-cover border border-slate-100 shadow-sm print:hidden" onError={() => handleImageError(item.id)} />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 print:hidden text-lg">📦</div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-slate-800">{item.item_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium text-slate-700">{item.qty}</td>
                                        <td className="px-6 py-4 text-right text-slate-600">{formatMoney(item.custom_price_sold_at)} KHR</td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-800">{formatMoney(item.qty * item.custom_price_sold_at)} KHR</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals Block */}
                    <div className="flex flex-col sm:flex-row justify-between items-end gap-8 border-t border-slate-200 pt-8">
                        <div className="w-full sm:w-1/2">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Payment Method</p>
                            <p className="text-slate-800 font-medium">{paymentLabel}</p>
                        </div>
                        
                        <div className="w-full sm:w-80 space-y-3">
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Subtotal</span>
                                <span>{formatMoney(invoice.total_khr)} KHR</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Tax (0%)</span>
                                <span>0 KHR</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-2">
                                <span className="text-lg font-bold text-slate-800">Total</span>
                                <span className="text-2xl font-black text-indigo-600">{formatMoney(invoice.total_khr)} KHR</span>
                            </div>
                        </div>
                    </div>
                    
                </div>
                
                {/* Footer Bar */}
                <div className="bg-slate-800 text-slate-300 p-6 text-center text-sm rounded-b-sm print:hidden">
                    Thank you for shopping at Mart 2500!
                </div>
            </div>
            
        </POSLayout>
    );
}
