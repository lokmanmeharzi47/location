"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Loading from "@/components/Loading";
import OrderForm from "@/components/OrderForm";
import Modal from "@/components/Modal";

// Debounce function for limiting the frequency of scroll event firing
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

export default function CategoryPage() {
  const pathname = usePathname();
  const category = pathname.split("/").pop();

  const [displayImages, setDisplayImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [firstLoadComplete, setFirstLoadComplete] = useState(false);
  const [error, setError] = useState(null);

  const seenImageIds = useRef(new Set());
  const sentinelRef = useRef(null);

  // Dynamic image size loader based on viewport width
  const customLoader = ({ src }) => {
    const width = window.innerWidth <= 768 ? 300 : 600;  // Adjust size based on screen width
    return `${src}?w=${width}`;
  };

  const fetchImages = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/getImagesByCategory/${category}?next_cursor=${nextCursor || ""}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.images && data.images.length > 0) {
          // Filter out already seen images
          const newImages = data.images.filter(
            (img) => !seenImageIds.current.has(img.public_id)
          );
          newImages.forEach((img) => seenImageIds.current.add(img.public_id));
          setDisplayImages((prev) => [...prev, ...newImages]);
          setNextCursor(data.next_cursor);
          setHasMore(!!data.next_cursor);
          setFirstLoadComplete(true);
        } else {
          setHasMore(false);
        }
      } else {
        setError("Failed to fetch images.");
      }
    } catch (err) {
      console.error("Error fetching images:", err);
      setError("An error occurred while fetching images.");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, nextCursor, category]);

  useEffect(() => {
    const debounceFetch = debounce(() => {
      if (
        sentinelRef.current &&
        sentinelRef.current.getBoundingClientRect().top < window.innerHeight
      ) {
        fetchImages();
      }
    }, 300); // Adjust the debounce delay to optimize fetch timing

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading && firstLoadComplete) {
        debounceFetch();
      }
    }, { rootMargin: "100px" });

    if (sentinelRef.current) observer.observe(sentinelRef.current);

    return () => {
      if (sentinelRef.current) observer.unobserve(sentinelRef.current);
    };
  }, [fetchImages, hasMore, loading, firstLoadComplete]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleRetry = () => {
    fetchImages();
  };

  return (
    <div className="p-4 pt-16 md:pt-24">
      {!selectedImage ? (
        <>
          <h1 className="text-2xl font-bold mb-6 text-center">{category}</h1>
          {error && (
            <div className="text-center text-red-500">
              <p>{error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Retry
              </button>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 min-h-screen">
            {displayImages.length > 0 ? (
             displayImages.map((image, index) => (
              <div
              key={`${image.public_id}-${index}`}
              role="button"
              tabIndex={0}
              onClick={() => handleImageClick(image)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleImageClick(image);
              }}
              className="relative overflow-hidden rounded-lg shadow-lg bg-white cursor-pointer"
            >
              <Image
                className="object-cover w-full h-full transition-transform duration-300 transform hover:scale-105"
                loader={customLoader}
                unoptimized
                src={image.secure_url || "/images/t-shirtcat.png"}
                alt={`${category} ${image.public_id}`}
                width={300}
                height={300}
                loading="lazy"
                placeholder="blur"
                blurDataURL="/images/loader.png"
              />
              
              {/* Price overlay */}
              {image.tags[0] && (
                <div  dir="ltr" className="absolute bottom-2 left-2 z-30 bg-black/70  text-white text-sm font-semibold py-1 px-3 rounded-md">
                  {image.tags[0]} DA
                </div>
              )}
            </div>
            ))
            ) : (
              !loading && (
                <div className="col-span-full text-xl text-gray-600 flex justify-center items-center min-h-screen">
                  لا يتوفر منتجات
                </div>
              )
            )}
          </div>
          {loading && <Loading />}
          <div ref={sentinelRef} className="h-1"></div>
        </>
      ) : (
        <Modal onClose={() => setSelectedImage(null)}>
          <OrderForm selectedImage={selectedImage} />
        </Modal>
      )}
    </div>
  );
}
