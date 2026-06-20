export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex justify-center items-center rounded-xl border border-transparent bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 text-sm font-bold tracking-wide text-white shadow-md shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95 ${
                    disabled && 'opacity-50 cursor-not-allowed'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
