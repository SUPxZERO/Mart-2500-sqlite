import { useState } from 'react';

export default function ItemCard({ item, qtyInCart = 0, onClick }) {
    const [imageError, setImageError] = useState(false);
    const formattedPrice = new Intl.NumberFormat('en-US').format(item.default_price);
    const hasImage = !!item.image_url && !imageError;
    const inCart = qtyInCart > 0;

    return (
        <button
            onClick={() => onClick(item)}
            className={`group relative flex flex-col h-48 bg-white/70 backdrop-blur-sm rounded-[1.5rem] shadow-sm border transition-all duration-300 active:scale-[0.97] hover:-translate-y-1 hover:shadow-xl w-full overflow-hidden ${
                inCart
                    ? 'border-indigo-400 shadow-indigo-100/50 shadow-md ring-2 ring-indigo-400/20'
                    : 'border-slate-200/60 hover:border-indigo-300'
            }`}
        >
            {/* Cart quantity badge */}
            {inCart && (
                <div className="absolute top-3 right-3 z-10 min-w-[1.6rem] h-[1.6rem] px-1 bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white text-xs font-black rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/40">
                    {qtyInCart}
                </div>
            )}

            {/* Image or gradient placeholder */}
            <div className="flex-1 w-full overflow-hidden relative bg-slate-50">
                {hasImage ? (
                    <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        <span className="text-4xl select-none opacity-40 mix-blend-luminosity">📦</span>
                    </div>
                )}
                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Name + Price footer */}
            <div className="w-full px-4 py-3 bg-white/90 backdrop-blur-md border-t border-slate-100 shrink-0">
                <p className="text-sm font-bold text-slate-800 text-center leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 mb-1.5">
                    {item.name}
                </p>
                <div className="flex items-center justify-center">
                    <span className="text-xs font-black text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100 shadow-sm">
                        {formattedPrice} KHR
                    </span>
                </div>
            </div>
        </button>
    );
}
