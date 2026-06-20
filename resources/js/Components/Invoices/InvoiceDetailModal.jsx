import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { t } from '@/i18n';
import { X, Printer, CheckCircle2, ExternalLink, Download } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { exportInvoicePdf } from '@/utils/exportInvoicePdf';

export default function InvoiceDetailModal({ isOpen, onClose, invoiceId }) {
    const [invoice, setInvoice] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [pdfError, setPdfError] = useState(null);
    const [imageErrors, setImageErrors] = useState({});
    const receiptRef = useRef(null);

    const handleImageError = (itemId) => {
        setImageErrors(prev => ({ ...prev, [itemId]: true }));
    };

    useEffect(() => {
        if (isOpen && invoiceId) {
            setIsLoading(true);
            setPdfError(null); // Clear previous errors when opening
            axios.get(`/invoices/${invoiceId}`)
                .then(res => {
                    setInvoice(res.data.invoice);
                })
                .catch(err => {
                    console.error("Failed to load invoice details", err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setInvoice(null);
        }
    }, [isOpen, invoiceId]);

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

    if (!isOpen) return null;

    const formatMoney = (amount) => new Intl.NumberFormat('en-US').format(amount);
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };
    const paymentLabel = (invoice?.payment_provider || invoice?.payment_method || '').replace('_', ' ');

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = async () => {
        if (!receiptRef.current || !invoice || isDownloadingPdf) {
            return;
        }

        setIsDownloadingPdf(true);
        setPdfError(null); // Clear previous errors

        try {
            console.log('📥 Starting PDF download for invoice:', invoice.invoice_number);
            await exportInvoicePdf(receiptRef.current, `INV-${invoice.invoice_number}.pdf`);
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
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="flex flex-col items-center max-h-[95vh] w-full max-w-md relative">
                
                {/* Close Button Header */}
                <div className="absolute -top-12 right-0 flex gap-2 print:hidden">
                    <button 
                        onClick={onClose}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="bg-white text-slate-800 w-full p-12 shadow-2xl rounded-sm flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                    </div>
                ) : invoice ? (
                    <div ref={receiptRef} id="receipt-paper" className="bg-white text-slate-800 w-full p-8 shadow-2xl rounded-sm relative overflow-y-auto animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:p-0">
                        {/* Zig-zag top border simulation */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSI4Ij48cGF0aCBkPSJNMCA4IEwxMCAwIEwyMCA4IFoiIGZpbGw9IiNmMThmMjYiLz48L3N2Zz4=')] opacity-10"></div>
                        
                        {/* Header */}
                        <div className="text-center mb-6 pt-2">
                            <h2 className="text-2xl font-black uppercase tracking-widest mb-1">Mart 2500</h2>
                            <p className="text-xs text-slate-500 uppercase">{t('app.best_pos')}</p>
                            <hr className="border-t-2 border-dashed border-slate-300 my-4" />
                            
                            <div className="flex justify-between items-center text-xs font-mono text-slate-500">
                                <span>{formatDate(invoice.created_at)}</span>
                                <span>{invoice.invoice_number}</span>
                            </div>
                            {invoice.customer && (
                                <div className="mt-2 text-left bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div className="flex justify-between items-center text-xs font-mono text-slate-500 uppercase mb-1">
                                        <span>{t('invoices.customer_label')}</span>
                                        <span className="font-bold text-slate-700">{invoice.customer.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                                        <span>Phone</span>
                                        <span>{invoice.customer.phone_number || 'N/A'}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Items List */}
                        <table className="w-full text-sm font-mono mb-6">
                            <thead>
                                <tr className="border-b border-dashed border-slate-300 text-slate-500 text-left">
                                    <th className="py-2">{t('invoices.item')}</th>
                                    <th className="py-2 text-center">{t('invoices.qty')}</th>
                                    <th className="py-2 text-right">{t('invoices.ext')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items?.map((item, index) => (
                                    <tr key={item.id || index} className="align-top border-b border-slate-50 last:border-0">
                                        <td className="py-3 pr-2">
                                            <div className="flex items-center gap-2">
                                                {item.image_url && !imageErrors[item.id] ? (
                                                    <img src={item.image_url} alt={item.item_name} className="w-8 h-8 rounded shrink-0 object-cover border border-slate-200 print:scale-150 print:mr-2" onError={() => handleImageError(item.id)} />
                                                ) : (
                                                    <div className="w-8 h-8 rounded shrink-0 bg-slate-100 flex items-center justify-center text-slate-300 border border-slate-200 text-xs print:scale-150 print:mr-2">📦</div>
                                                )}
                                                <div>
                                                    <p className="line-clamp-2 leading-tight text-slate-700">{item.item_name}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">@{formatMoney(item.custom_price_sold_at)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 text-center">{item.qty}</td>
                                        <td className="py-3 text-right">{formatMoney(item.custom_price_sold_at * item.qty)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div className="border-t-2 border-dashed border-slate-300 pt-4">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>{t('invoices.total_label')}</span>
                                <span>{formatMoney(invoice.total_khr)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-mono mt-1 text-slate-500 uppercase">
                                <span>{t('invoices.paid_by', { method: paymentLabel })}</span>
                                <span>{formatMoney(invoice.total_khr)}</span>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">{invoice.status?.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-xl text-slate-500">{t('invoices.invoice_not_found')}</div>
                )}

                {/* Actions (Not rendered in print) */}
                {invoice && !isLoading && (
                    <div className="mt-4 w-full print:hidden flex flex-col gap-2">
                        {/* Error Message */}
                        {pdfError && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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
                        
                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={isDownloadingPdf}
                            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Download className="w-5 h-5" />
                            {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}
                        </button>
                        <Link 
                            href={`/invoices/${invoice.id}/show`}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl shadow-sm transition-colors border border-indigo-200"
                        >
                            <ExternalLink className="w-5 h-5" />
                            View Full Invoice A4
                        </Link>
                        <button 
                            onClick={handlePrint}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition-colors border border-emerald-600"
                        >
                            <Printer className="w-5 h-5" />
                            {t('actions.print_receipt_copy')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
