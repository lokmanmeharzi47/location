import { i18n } from '@/i18n-config';
import { getDictionary } from '@/lib/dictionaries';
import ClientLayout from './ClientLayout';
import '@/app/globals.css';

export async function generateStaticParams() {
    return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return {
        title: dict.hero.main_title_1 + ' - ' + dict.hero.main_title_2,
        description: dict.hero.main_subtitle,
        alternates: {
            languages: {
                'ar': '/ar',
                'fr': '/fr',
                'en': '/en',
            },
        },
    };
}

export default async function RootLayout({ children, params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
            <head>
                <link rel="icon" href="/images/logo.jpg" type="image/jpg" />
            </head>
            <body className="bg-cream-50 min-h-screen" suppressHydrationWarning>
                <ClientLayout lang={lang} dict={dict}>
                    {children}
                </ClientLayout>
            </body>
        </html>
    );
}
