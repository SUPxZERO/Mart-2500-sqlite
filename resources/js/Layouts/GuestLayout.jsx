import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div 
            className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-0 relative overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: "url('/images/login-bg.png')" }}
        >
            {/* Dark overlay for contrast */}
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm pointer-events-none" />
            
            <div className="z-10 w-full sm:max-w-md">
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <div className="flex flex-col items-center">
                            <div className="h-16 w-16 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 transform transition hover:scale-105 duration-300">
                                <ApplicationLogo className="h-10 w-10 fill-white" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-md">
                                Mart 2500
                            </h1>
                            <p className="text-sm font-bold text-slate-200 mt-1 uppercase tracking-widest drop-shadow-sm">
                                Retail OS
                            </p>
                        </div>
                    </Link>
                </div>

                <div className="w-full overflow-hidden bg-white/80 backdrop-blur-xl px-8 py-10 shadow-2xl shadow-indigo-900/10 sm:rounded-[2rem] border border-white/50 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
