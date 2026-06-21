import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Printer, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export default function ReceiptModal({ isOpen, onClose, paymentData }) {
    // Use selective subscriptions instead of destructuring all at once
    const cart = useCartStore((state) => state.cart);
    const selectedCustomer = useCartStore((state) => state.selectedCustomer);
    const clearCart = useCartStore((state) => state.clearCart);

    useEffect(() => {
        if (!isOpen || !paymentData) {
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
    }, [isOpen, onClose, paymentData]);

    // Memoize total calculation - recalculates when cart changes
    const total = useMemo(() => {
        if (cart.length === 0) return 0;
        return cart.reduce((sum, item) => {
            const price = item.custom_price_sold_at || item.default_price || 0;
            const qty = item.qty || 0;
            return sum + (price * qty);
        }, 0);
    }, [cart]);

    if (!isOpen || !paymentData) return null;

    const formatMoney = (amount) => new Intl.NumberFormat('en-US').format(amount);
    const date = new Date().toLocaleString('en-GB');

    const handleNewOrder = () => {
        clearCart();
        onClose();
    };

    const handlePrint = () => {
        window.print();
        // In Sprint 5, we will route this to NativePHP's direct printing API
    };

    const modalContent = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="flex flex-col items-center max-h-[95vh] w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                
                {/* Success Indicator */}
                <div className="mb-4 flex items-center gap-2 text-emerald-400 bg-slate-900/80 px-6 py-2 rounded-full shadow-lg">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold tracking-wide">ORDER COMPLETE</span>
                </div>

                {/* Thermal Receipt Paper */}
                <div id="receipt-paper" className="bg-white text-slate-800 w-full p-8 shadow-2xl rounded-sm relative overflow-y-auto print:shadow-none print:p-0">
                    {/* Zig-zag top border simulation */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSI4Ij48cGF0aCBkPSJNMCA4IEwxMCAwIEwyMCA4IFoiIGZpbGw9IiNmMThmMjYiLz48L3N2Zz4=')] opacity-10"></div>
                    
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-black uppercase tracking-widest mb-1">Mart 2500</h2>
                        <p className="text-xs text-slate-500 uppercase">Cambodia's Best POS</p>
                        <hr className="border-t-2 border-dashed border-slate-300 my-4" />
                        
                        <div className="flex justify-between items-center text-xs font-mono text-slate-500">
                            <span>{date}</span>
                            <span>{paymentData.invoice_number || 'INV-PENDING'}</span>
                        </div>
                        {selectedCustomer && (
                            <div className="flex justify-between items-center text-xs font-mono text-slate-500 mt-1 uppercase">
                                <span>Customer:</span>
                                <span>{selectedCustomer.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Items List */}
                    <table className="w-full text-sm font-mono mb-6">
                        <thead>
                            <tr className="border-b border-dashed border-slate-300 text-slate-500 text-left">
                                <th className="py-2">Item</th>
                                <th className="py-2 text-center">Qty</th>
                                <th className="py-2 text-right">Ext</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((item, index) => (
                                <tr key={index} className="align-top">
                                    <td className="py-2 pr-2">
                                        <p className="line-clamp-2">{item.name}</p>
                                        <p className="text-xs text-slate-400">@{formatMoney(item.custom_price_sold_at)}</p>
                                    </td>
                                    <td className="py-2 text-center">{item.qty}</td>
                                    <td className="py-2 text-right">{formatMoney(item.custom_price_sold_at * item.qty)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="border-t-2 border-dashed border-slate-300 pt-4">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>TOTAL KHR</span>
                            <span>{formatMoney(total)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-mono mt-1 text-slate-500">
                            <span>
                                PAID BY {((paymentData?.provider?.display_name || paymentData?.method) || 'Unknown').replace('_', ' ')}
                            </span>
                            <span>{formatMoney(paymentData?.received_khr || 0)}</span>
                        </div>
                        {(paymentData?.change_khr || 0) > 0 && (
                            <div className="flex justify-between items-center text-sm font-mono mt-1 text-slate-500">
                                <span>CHANGE</span>
                                <span>{formatMoney(paymentData.change_khr)}</span>
                            </div>
                        )}
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-xs font-mono text-slate-400 uppercase">Thank you for your business!</p>
                    </div>
                </div>

                {/* Actions (Not rendered in print) */}
                <div className="mt-6 flex w-full gap-3 print:hidden">
                    <button 
                        onClick={handlePrint}
                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl shadow-lg transition-colors border border-slate-200"
                    >
                        <Printer className="w-5 h-5" />
                        Print Receipt
                    </button>
                    <button 
                        onClick={handleNewOrder}
                        className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg transition-colors"
                    >
                        New Order
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
