"use client";
import "./globals.css";
import Loading from "../components/Loading";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Wait for client-side mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logo.jpg" type="image/jpg" />
        <title>CarRent – أفضل خدمة تأجير سيارات</title>
        <meta name="description" content="CarRent - خدمة تأجير السيارات الأفضل في الجزائر. سيارات حديثة، أسعار منافسة، وخدمة عملاء متميزة." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CarRent – أفضل خدمة تأجير سيارات" />
        <meta property="og:description" content="CarRent - خدمة تأجير السيارات الأفضل في الجزائر. سيارات حديثة، أسعار منافسة، وخدمة عملاء متميزة." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CarRent – أفضل خدمة تأجير سيارات" />
        <meta name="twitter:description" content="CarRent - خدمة تأجير السيارات الأفضل في الجزائر." />
      </head>
      <body className="bg-cream-50 min-h-screen" suppressHydrationWarning>
        <SpeedInsights />
        {!mounted || isLoading ? (
          <Loading />
        ) : (
          <>
            <Header />
            <main>{children}</main>
            <Footer />
          </>
        )}
      </body>
    </html>
  );
}