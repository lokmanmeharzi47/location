"use client";
import "./globals.css";
import Loading from "../components/Loading";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";

export default function RootLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const videoPromise = new Promise((resolve) => {
      const video = document.createElement("video");
      video.src = "/videos/hero.mp4";
      video.onloadeddata = resolve;
      video.onerror = resolve; // Handle error gracefully
    });

    const imagesToLoad = ["/images/Logo.png"];
    const imagePromises = imagesToLoad.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = resolve; // Handle error gracefully
        })
    );

    Promise.all([videoPromise, ...imagePromises]).then(() => {
      setIsLoading(false);
    });
  }, []);

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/Logo.png" type="image/png" />
        <title>Rital – أناقتك تبدأ من هنا</title>
        <meta name="description" content="ملابس نسائية مصممة بذوق راقٍ، تطريز أنيق وجودة عالية تناسب كل المناسبات. اكتشفي تشكيلتنا الفريدة من الفساتين والبلايز والأطقم النسائية." />
        <meta property="og:url" content="https://embrocraft-dz.vercel.app/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Rital – أناقتك تبدأ من هنا" />
        <meta property="og:description" content="ملابس نسائية مصممة بذوق راقٍ، تطريز أنيق وجودة عالية تناسب كل المناسبات. اكتشفي تشكيلتنا الفريدة من الفساتين والبلايز والأطقم النسائية." />
        <meta property="og:image" content="https://embrocraft-dz.vercel.app/images/Logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="rital.vercel.app" />
        <meta property="twitter:url" content="https://rital.vercel.app/" />
        <meta name="twitter:title" content="Rital – أناقتك تبدأ من هنا" />
        <meta name="twitter:description" content="ملابس نسائية مصممة بذوق راقٍ، تطريز أنيق وجودة عالية تناسب كل المناسبات." />
        <meta name="twitter:image" content="https://embrocraft-dz.vercel.app/images/Logo.png" />
      </head>
      <body className="bg-cream-50 min-h-screen">
        {isLoading ? <Loading /> : (
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