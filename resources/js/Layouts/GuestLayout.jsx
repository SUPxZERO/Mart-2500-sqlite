import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div 
            className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-0 relative overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: "url('/images/login-bg.png')" }}
        >
            {/* Dark overlay for contrast and blur */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md pointer-events-none" />
            
            <div className="z-10 w-full sm:max-w-md relative">
                {/* Decorative glowing blobs behind the card */}
                <div className="absolute -top-10 -left-10 w-48 h-48 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse"></div>
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-fuchsia-500 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="flex flex-col items-center mb-8 relative z-10">
                    <h1 className="text-5xl font-black tracking-tight text-white drop-shadow-lg mb-2">
                        Mart 2500
                    </h1>
                    <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest drop-shadow-md">
                        Retail OS
                    </p>
                </div>

                <div className="w-full overflow-hidden bg-white/90 rounded-2xl backdrop-blur-2xl px-8 py-10 shadow-2xl shadow-slate-900/50 sm:rounded-[3rem] border border-white/40 relative z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
