import React from 'react';

export default function PageBackground({ imageUrl, overlayOpacity = 'bg-slate-100/30' }) {
    if (!imageUrl) return null;

    return (
        <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
            <img 
                src={imageUrl} 
                alt="Background" 
                className="w-full h-full object-cover opacity-90 transition-opacity duration-700 ease-in-out"
            />
            {/* Subtle overlay */}
            <div className={`absolute inset-0 ${overlayOpacity} backdrop-blur-[2px] transition-colors duration-700`}></div>
        </div>
    );
}
