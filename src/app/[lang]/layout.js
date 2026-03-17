import { i18n } from '@/i18n-config';
import { getDictionary } from '@/lib/dictionaries';
import ClientLayout from './ClientLayout';
import '@/app/globals.css';
import Script from 'next/script';

export async function generateStaticParams() {
    return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({ params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    const seoTitle = dict?.seo?.title || dict.hero.main_title_1 + ' - ' + dict.hero.main_title_2;
    const seoDescription = dict?.seo?.description || dict.hero.main_subtitle;
    const seoKeywords = dict?.seo?.keywords || '';

    return {
        title: seoTitle,
        description: seoDescription,
        keywords: seoKeywords,
        alternates: {
            languages: {
                'ar': '/ar',
                'fr': '/fr',
                'en': '/en',
            },
        },
        openGraph: {
            title: seoTitle,
            description: seoDescription,
            type: 'website',
            locale: lang === 'ar' ? 'ar_DZ' : lang === 'fr' ? 'fr_DZ' : 'en_US',
            siteName: 'Luxury Location',
        },
        twitter: {
            card: 'summary_large_image',
            title: seoTitle,
            description: seoDescription,
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

// LocalBusiness JSON-LD structured data
const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "name": "Luxury Location",
    "description": "Location voiture Alger – Service premium de location de voitures à Alger avec livraison aéroport Houari Boumediene et tous quartiers.",
    "url": "https://luxurylocation.dz",
    "telephone": "+213779132534",
    "address": {
        "@type": "PostalAddress",
        "addressLocality": "Alger",
        "addressRegion": "Alger",
        "addressCountry": "DZ"
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": "36.7538",
        "longitude": "3.0588"
    },
    "areaServed": [
        "Alger", "Bab Ezzouar", "Dar El Beida", "Hydra",
        "Cheraga", "Zeralda", "Staoueli"
    ],
    "priceRange": "$$",
    "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "00:00",
        "closes": "23:59"
    },
    "sameAs": [
        "https://www.instagram.com/luxury_location_de_voiture/"
    ]
};

export default async function RootLayout({ children, params }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return (
        <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
            <head>
                <link rel="icon" href="/images/logo.jpg" type="image/jpg" />
                <Script
                    id="local-business-schema"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
                    strategy="afterInteractive"
                />
            </head>
            <body className="bg-cream-50 min-h-screen" suppressHydrationWarning>
                <ClientLayout lang={lang} dict={dict}>
                    {children}
                </ClientLayout>
            </body>
        </html>
    );
}

