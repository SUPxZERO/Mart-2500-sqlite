import AppShell from '@/Components/Layout/AppShell';
import PageContent from '@/Components/Layout/PageContent';
import PageHeader from '@/Components/Layout/PageHeader';
import PageBackground from '@/Components/Layout/PageBackground';
import { t } from '@/i18n';
import { useEffect } from 'react';
import {
    LayoutDashboard,
    Package,
    Receipt,
    Settings,
    ShoppingCart,
    Users,
    Tags,
} from 'lucide-react';

export default function POSLayout({
    children,
    title,
    description,
    eyebrow = t('app.brand'),
    icon,
    actions,
    header,
    contentClassName = '',
    contentWidth = 'full',
    contentPadded = true,
    scrollable = true,
    backgroundImage,
}) {
    const pathname =
        typeof window !== 'undefined' ? window.location.pathname : '';

    useEffect(() => {
        const isEditableTarget = (target) => {
            if (!(target instanceof HTMLElement)) {
                return false;
            }

            return (
                target.isContentEditable ||
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
            );
        };

        const getSearchTarget = () => {
            const candidates = Array.from(
                document.querySelectorAll('[data-page-search="true"]'),
            );

            return candidates
                .reverse()
                .find((element) => {
                    if (!(element instanceof HTMLElement)) {
                        return false;
                    }

                    return (
                        !element.hasAttribute('disabled') &&
                        element.offsetParent !== null
                    );
                });
        };

        const handleKeydown = (event) => {
            if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'f') {
                return;
            }

            if (isEditableTarget(event.target)) {
                return;
            }

            const searchTarget = getSearchTarget();

            if (!searchTarget) {
                return;
            }

            event.preventDefault();
            searchTarget.focus();

            if ('select' in searchTarget && typeof searchTarget.select === 'function') {
                searchTarget.select();
            }
        };

        window.addEventListener('keydown', handleKeydown);

        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    }, []);

    const navigation = [
        {
            href: '/pos',
            icon: ShoppingCart,
            label: t('nav.checkout'),
            description: t('nav.checkout_description'),
            active: pathname.startsWith('/pos'),
        },
        {
            href: '/items',
            icon: Package,
            label: 'Items',
            description: 'Manage product catalog',
            active: pathname.startsWith('/items'),
        },
        {
            href: '/categories',
            icon: Tags,
            label: 'Categories',
            description: 'Manage item categories',
            active: pathname.startsWith('/categories'),
        },
        {
            href: '/invoices',
            icon: Receipt,
            label: t('nav.invoices'),
            description: t('nav.invoices_description'),
            active: pathname.startsWith('/invoices'),
        },
        {
            href: '/customers',
            icon: Users,
            label: t('nav.customers'),
            description: t('nav.customers_description'),
            active: pathname.startsWith('/customers'),
        },
        {
            href: '/dashboard',
            icon: LayoutDashboard,
            label: t('nav.dashboard'),
            description: t('nav.dashboard_description'),
            active: pathname.startsWith('/dashboard'),
        },
        {
            href: '/settings',
            icon: Settings,
            label: t('nav.settings'),
            description: t('nav.settings_description'),
            active: pathname.startsWith('/settings'),
        },
    ];

    return (
        <AppShell brand={t('app.brand')} navigation={navigation}>
            <PageBackground imageUrl={backgroundImage} />
            <div className="flex flex-1 flex-col relative z-0 min-h-0">
                {(title || header) && (
                    <PageHeader
                        eyebrow={eyebrow}
                        title={title}
                        description={description}
                        icon={icon}
                        actions={actions}
                    >
                        {header}
                    </PageHeader>
                )}

                <PageContent
                    className={contentClassName}
                    width={contentWidth}
                    padded={contentPadded}
                    scrollable={scrollable}
                >
                    {children}
                </PageContent>
            </div>
        </AppShell>
    );
}
