function joinClasses(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function PageHeader({
    eyebrow,
    title,
    description,
    icon: Icon,
    actions,
    children,
}) {
    return (
        <header className="border-b border-[var(--app-border)] bg-white/60 backdrop-blur-md lg:sticky top-0 z-10 shrink-0">
            <div className="flex w-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        {eyebrow && (
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
                                {eyebrow}
                            </p>
                        )}

                        <div className="flex items-start gap-4">
                            {Icon && (
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.12)]">
                                    <Icon className="h-7 w-7" />
                                </div>
                            )}

                            <div className="min-w-0">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                                    {title}
                                </h1>
                                {description && (
                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
                                        {description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {actions && (
                        <div className="flex shrink-0 flex-wrap items-center gap-3">
                            {actions}
                        </div>
                    )}
                </div>

                {children && (
                    <div
                        className={joinClasses(
                            'rounded-3xl border border-slate-200 bg-slate-50/70 p-4',
                        )}
                    >
                        {children}
                    </div>
                )}
            </div>
        </header>
    );
}
