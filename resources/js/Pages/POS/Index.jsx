import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import POSLayout from '@/Layouts/POSLayout';
import ItemCard from '@/Components/POS/ItemCard';
import SearchBar from '@/Components/POS/SearchBar';
import Cart from '@/Components/POS/Cart';
import { t } from '@/i18n';
import { useCartStore } from '@/store/useCartStore';

export default function POSIndex({ items, customers, exchange_rate, payment_gateways }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    // Use selective subscriptions instead of destructuring all at once
    const addItem = useCartStore((state) => state.addItem);
    const cart = useCartStore((state) => state.cart);

    // Barcode scanner state
    const [barcode, setBarcode] = useState('');

    // Build unique category list
    const categories = useMemo(() => {
        const cats = [...new Set(items.map(i => i.category).filter(Boolean))];
        return ['All', ...cats.sort()];
    }, [items]);

    // Build a quick lookup: item id -> qty in cart
    const cartQtyMap = useMemo(() => {
        return cart.reduce((map, ci) => {
            map[ci.id] = (map[ci.id] || 0) + ci.qty;
            return map;
        }, {});
    }, [cart]);

    // Filter by category then search
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [items, activeCategory, searchQuery]);

    // Barcode scanner handler - Fixed version
    useEffect(() => {
        // Create a stable reference for the barcode accumulator
        let accumulatedBarcode = '';
        let barcodeTimeout = null;

        const handleKeyPress = (event) => {
            // Don't capture if typing in an input field
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            // Barcode scanners typically send keys rapidly and end with Enter
            if (event.key === 'Enter') {
                if (accumulatedBarcode.trim().length > 0) {
                    console.log('🔍 Scanning barcode:', accumulatedBarcode);
                    
                    // Try to find item by barcode (exact match first, then by name)
                    const foundItem = items.find((item) => {
                        // Match by barcode if it exists
                        if (item.barcode && item.barcode.toString() === accumulatedBarcode) {
                            console.log('✅ Matched by barcode:', item.name);
                            return true;
                        }
                        // Fallback: match by ID
                        if (item.id.toString() === accumulatedBarcode) {
                            console.log('✅ Matched by ID:', item.name);
                            return true;
                        }
                        // Fallback: match by name contains
                        if (item.name.toLowerCase().includes(accumulatedBarcode.toLowerCase())) {
                            console.log('✅ Matched by name:', item.name);
                            return true;
                        }
                        return false;
                    });

                    if (foundItem) {
                        addItem(foundItem);
                        console.log('✅ Item added to cart:', foundItem.name, 'Price:', foundItem.default_price);
                    } else {
                        console.warn('❌ No item found for barcode:', accumulatedBarcode);
                    }

                    // Reset barcode for next scan
                    accumulatedBarcode = '';
                    setBarcode('');
                }
                event.preventDefault();
                return;
            }

            // Accumulate regular characters (not special keys)
            if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                accumulatedBarcode += event.key;
                setBarcode(accumulatedBarcode);

                // Clear existing timeout
                if (barcodeTimeout) {
                    clearTimeout(barcodeTimeout);
                }

                // Reset barcode if no input for 250ms (scanner should finish by then)
                barcodeTimeout = setTimeout(() => {
                    console.warn('⏱️ Barcode timeout - no input for 250ms. Clearing:', accumulatedBarcode);
                    accumulatedBarcode = '';
                    setBarcode('');
                }, 250); // Increased from 100ms to 250ms
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            if (barcodeTimeout) {
                clearTimeout(barcodeTimeout);
            }
        };
    }, [items, addItem]); // ← Removed 'barcode' dependency!

    return (
        <POSLayout
            title={t('pos.workspace_title')}
            description={t('pos.workspace_description')}
            contentPadded={false}
            contentWidth="full"
            scrollable={false}
            backgroundImage="/images/backgrounds/bg_pos.png"
        >
            <Head title={t('pos.page_title')} />
            
            <div className="flex flex-1 flex-col overflow-hidden min-h-0 lg:flex-row">
                
                {/* Left Side: Item Catalog Wrapper */}
                <div className="relative flex min-h-0 flex-1 flex-col border-b border-white/50 bg-white/40 backdrop-blur-md lg:border-b-0 lg:border-r">
                    
                    {/* Search Bar Header */}
                    <header className="z-10 flex items-center border-b border-white/50 bg-white/60 px-4 py-4 shadow-sm sm:px-6">
                        <div className="flex w-full items-center justify-center">
                            <SearchBar value={searchQuery} onChange={setSearchQuery} />
                        </div>
                    </header>

                    {/* Category Filter Tabs */}
                    <div className="flex gap-2.5 overflow-x-auto px-5 pt-4 pb-2 sm:px-6 scrollbar-none bg-transparent">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                                    activeCategory === cat
                                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-200/50 scale-105'
                                        : 'bg-white text-slate-500 border border-slate-200/80 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Scrollable Item Grid */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 scroll-smooth sm:p-6">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                            {filteredItems.map((item) => (
                                <ItemCard 
                                    key={item.id} 
                                    item={item}
                                    qtyInCart={cartQtyMap[item.id] || 0}
                                    onClick={addItem} 
                                />
                            ))}
                            {filteredItems.length === 0 && (
                                <div className="col-span-full py-16 text-center text-slate-400">
                                    <p className="text-4xl mb-2">🔍</p>
                                    <p className="font-medium">No items found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Active Cart Drawer/Pane */}
                <div className="z-20 flex min-h-0 w-full shrink-0 flex-col border-l border-white/50 bg-white/60 backdrop-blur-md shadow-xl lg:w-[26rem] lg:shadow-none">
                    <Cart customers={customers} exchangeRate={exchange_rate} paymentGateways={payment_gateways} />
                </div>

            </div>
        </POSLayout>
    );
}
