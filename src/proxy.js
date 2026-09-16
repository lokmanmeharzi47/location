import { NextResponse } from 'next/server';
import { i18n } from './i18n-config';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

function getLocale(request) {
    const negotiatorHeaders = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

    const locales = i18n.locales;
    // @ts-ignore
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

    try {
        return matchLocale(languages, locales, i18n.defaultLocale);
    } catch (e) {
        return i18n.defaultLocale;
    }
}

export function proxy(request) {
    const pathname = request.nextUrl.pathname;

    // Do not redirect sitemap, robots, or static files with extensions
    if (
        pathname === '/sitemap.xml' ||
        pathname === '/robots.txt' ||
        pathname.startsWith('/sitemap') ||
        pathname.includes('.')
    ) {
        return;
    }

    // Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = i18n.locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
        const locale = getLocale(request);
        return NextResponse.redirect(
            new URL(
                `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
                request.url
            )
        );
    }
}

export const config = {
    // Matcher ignoring internal paths, assets, and metadata routes
    matcher: ['/((?!api|_next/static|_next/image|images|videos|favicon.ico|sitemap.xml|robots.txt).*)'],
};
