function joinClasses(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function PageContent({
    children,
    className = '',
    width = 'full',
    padded = true,
    scrollable = true,
}) {
    const widthClass =
        width === 'narrow'
            ? 'max-w-3xl'
            : width === 'wide'
              ? 'max-w-7xl'
              : 'max-w-none';

    return (
        <div className={`flex-1 flex flex-col lg:min-h-0 ${scrollable ? 'lg:overflow-y-auto overflow-visible' : 'overflow-hidden'}`}>
            <div
                className={joinClasses(
                    'mx-auto w-full flex-1 flex flex-col lg:min-h-0',
                    widthClass,
                    padded && 'px-4 py-6 sm:px-6 lg:px-8 lg:py-8',
                    className,
                )}
            >
                {children}
            </div>
        </div>
    );
}
