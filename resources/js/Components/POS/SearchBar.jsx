import { Search, X } from 'lucide-react';
import { t } from '@/i18n';

export default function SearchBar({ value, onChange }) {
    return (
        <div className="relative w-full max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
            </div>
            
            <input
                data-page-search="true"
                type="text"
                autoFocus
                className="block w-full pl-11 pr-10 py-3 border border-slate-200/80 rounded-2xl leading-5 bg-white/80 backdrop-blur-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all duration-300 shadow-sm hover:border-indigo-300"
                placeholder={t('pos.search_items_placeholder')}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 outline-none"
                    title={t('actions.clear_search')}
                >
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
    );
}
