import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
        cart: [],
        selectedCustomer: null,

        // Actions
        addItem: (item) => {
            set((state) => {
                const existingItemIndex = state.cart.findIndex(i => i.id === item.id);
                
                if (existingItemIndex > -1) {
                    // Item exists, increase quantity
                    const newCart = [...state.cart];
                    newCart[existingItemIndex].qty += 1;
                    return { cart: newCart };
                }
                
                // New item, add to cart with qty = 1 and default price (always integer KHR)
                const price = item.default_price ? Math.round(item.default_price) : 0;
                return {
                    cart: [
                        ...state.cart,
                        {
                            ...item,
                            qty: 1,
                            // Guard: ensure price is always a safe integer (no floats)
                            custom_price_sold_at: price,
                            default_price: item.default_price || 0
                        }
                    ]
                };
            });
        },

    removeItem: (index) => {
        set((state) => ({
            cart: state.cart.filter((_, i) => i !== index)
        }));
    },

    updateQty: (index, delta) => {
        set((state) => {
            const newCart = [...state.cart];
            const newQty = newCart[index].qty + delta;
            
            if (newQty <= 0) {
                // If qty goes to 0 or below, remove the item
                return { cart: state.cart.filter((_, i) => i !== index) };
            }
            
            newCart[index].qty = newQty;
            return { cart: newCart };
        });
    },

    setQty: (index, qty) => {
        set((state) => {
            const newCart = [...state.cart];
            if (qty <= 0) {
                return { cart: state.cart.filter((_, i) => i !== index) };
            }
            newCart[index].qty = qty;
            return { cart: newCart };
        });
    },

    setCustomPrice: (index, newPrice) => {
        set((state) => {
            const newCart = [...state.cart];
            newCart[index].custom_price_sold_at = parseInt(newPrice) || 0;
            return { cart: newCart };
        });
    },

    setSelectedCustomer: (customer) => {
        set({ selectedCustomer: customer });
    },

    clearCart: () => {
        set({ cart: [], selectedCustomer: null });
    },
    
    // Selectors/Computed values
    getCartTotal: () => {
        const state = get();
        return state.cart.reduce((total, item) => {
            const price = item.custom_price_sold_at || item.default_price || 0;
            const qty = item.qty || 0;
            const itemTotal = Math.max(0, price * qty); // Ensure no negative values
            return total + itemTotal;
        }, 0);
    }
}));
