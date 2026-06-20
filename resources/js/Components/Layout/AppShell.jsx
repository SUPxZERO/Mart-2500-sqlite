import { Link } from '@inertiajs/react';
import { t } from '@/i18n';
import { Menu, X, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

function joinClasses(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function AppShell({
    brand = 'Mart 2500',
    navigation = [],
    children,
}) {
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    useEffect(() => {
        if (!isMobileNavOpen) {
            return undefined;
        }

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsMobileNavOpen(false);
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isMobileNavOpen]);

    return (
        <div className="flex h-full w-full overflow-hidden bg-transparent text-slate-900">
            <aside className="hidden w-72 shrink-0 glass-sidebar text-slate-800 lg:flex lg:flex-col shadow-xl z-20">
                <BrandBlock brand={brand} />
                <NavigationList
                    navigation={navigation}
                    className="flex-1 px-4 py-6"
                    onNavigate={() => {}}
                />
                
                <div className="mt-auto border-t border-slate-200/60 p-4 bg-white/50">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                    >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 transition group-hover:bg-rose-100 group-hover:text-rose-500">
                            <LogOut className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                            <span className="block text-sm font-semibold">Logout</span>
                            <span className="block text-xs text-slate-400 group-hover:text-rose-500/70">End session</span>
                        </span>
                    </Link>
                </div>
            </aside>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <div className="sticky top-0 z-40 border-b border-[var(--app-border)] bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                {brand}
                            </p>
                            <p className="text-sm font-semibold text-slate-700">
                                {t('app.mobile_workspace')}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsMobileNavOpen(true)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-600"
                            aria-label={t('actions.open_navigation')}
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <main className="flex min-h-0 flex-1 flex-col">{children}</main>
            </div>

            {isMobileNavOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setIsMobileNavOpen(false)}
                        aria-label={t('actions.close_navigation_backdrop')}
                    />

                    <div className="absolute inset-y-0 left-0 flex w-[86vw] max-w-sm flex-col border-r border-slate-200 bg-white text-slate-800 shadow-2xl">
                        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5">
                            <BrandBlock brand={brand} compact />
                            <button
                                type="button"
                                onClick={() => setIsMobileNavOpen(false)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
                                aria-label={t('actions.close_navigation')}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <NavigationList
                            navigation={navigation}
                            className="flex-1 px-4 py-6"
                            onNavigate={() => setIsMobileNavOpen(false)}
                        />

                        <div className="mt-auto border-t border-slate-200/60 p-4 bg-slate-50/50">
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                            >
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-400 border border-slate-200 transition group-hover:border-rose-200 group-hover:text-rose-500 shadow-sm">
                                    <LogOut className="h-5 w-5" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sm font-semibold">Logout</span>
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function BrandBlock({ brand, compact = false }) {
    return (
        <div className={joinClasses('space-y-1', compact ? 'pr-4' : 'px-6 py-6')}>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">
                {t('app.retail_os')}
            </p>
            <p className="text-2xl font-black tracking-tight text-indigo-700">
                {brand}
            </p>
            <p className="text-sm text-slate-500">
                {t('app.sidebar_tagline')}
            </p>
        </div>
    );
}

function NavigationList({ navigation, className, onNavigate }) {
    return (
        <nav className={className}>
            <ul className="space-y-2">
                {navigation.map((item) => (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            onClick={onNavigate}
                            className={joinClasses(
                                'group flex items-center gap-3 rounded-2xl px-4 py-3 transition',
                                item.active
                                    ? 'bg-indigo-50 text-indigo-700 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]'
                                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-indigo-600',
                            )}
                            preserveState
                        >
                            <span
                                className={joinClasses(
                                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition',
                                    item.active
                                        ? 'bg-indigo-100 text-indigo-600'
                                        : 'bg-white border border-slate-200 text-slate-400 group-hover:border-indigo-200 group-hover:text-indigo-500 shadow-sm',
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                            </span>

                            <span className="min-w-0">
                                <span className="block text-sm font-semibold">
                                    {item.label}
                                </span>
                                {item.description && (
                                    <span className="block text-xs text-slate-400 group-hover:text-slate-500">
                                        {item.description}
                                    </span>
                                )}
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
