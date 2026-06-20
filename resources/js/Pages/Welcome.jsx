import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
                <div className="mx-auto flex max-w-5xl flex-col gap-10">
                    <header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-300">
                                Offline-First POS
                            </p>
                            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
                                Mart 2500 runs on your local network, not the internet.
                            </h1>
                            <p className="mt-4 text-base leading-7 text-slate-300">
                                Core POS, invoices, payments, settings, and backups are designed to keep working on a local server and local database.
                            </p>
                        </div>

                        <nav className="flex flex-wrap gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('pos')}
                                    className="rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-white transition hover:bg-emerald-400"
                                >
                                    Open POS
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-white transition hover:bg-emerald-400"
                                >
                                    Log In
                                </Link>
                            )}
                        </nav>
                    </header>

                    <main className="grid gap-6 md:grid-cols-3">
                        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
                            <h2 className="text-lg font-bold text-white">Local Data</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                Items, customers, invoices, exchange rates, and payment settings are stored in the local database.
                            </p>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
                            <h2 className="text-lg font-bold text-white">Manual Bank Confirmation</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                KHQR and account details can be shown offline. Cashier confirms transfer manually instead of calling live bank APIs.
                            </p>
                        </section>

                        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
                            <h2 className="text-lg font-bold text-white">Backup Ready</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                Download the SQLite database from Settings to keep shop data portable and recoverable without cloud services.
                            </p>
                        </section>
                    </main>

                    <footer className="text-sm text-slate-400">
                        Laravel v{laravelVersion} and PHP v{phpVersion}
                    </footer>
                </div>
            </div>
        </>
    );
}
