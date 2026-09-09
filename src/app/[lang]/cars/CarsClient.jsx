"use client";
import { useState, useEffect } from "react";
import CarCard from "@/components/CarCard";
import CarFilter from "@/components/CarFilter";
import BookingModal from "@/components/BookingModal";
import CarDetailsModal from "@/components/CarDetailsModal";

export default function CarsClient({ dict, lang }) {
    const [cars, setCars] = useState([]);
    const [filteredCars, setFilteredCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCar, setSelectedCar] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const response = await fetch('/api/cars');
            const data = await response.json();
            if (Array.isArray(data)) {
                setCars(data);
                setFilteredCars(data);
            }
        } catch (error) {
            console.error("Failed to fetch cars", error);
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Open Details Modal
    const handleCarSelect = (car) => {
        setSelectedCar(car);
        setIsDetailsModalOpen(true);
    };

    // Step 2: Proceed to Booking from Details
    const handleProceedToBooking = () => {
        setIsDetailsModalOpen(false);
        setIsBookingModalOpen(true);
    };

    const handleFilterChange = (filters) => {
        let result = cars;

        // Search
        if (filters.search) {
            const query = filters.search.toLowerCase();
            result = result.filter(car =>
                car.name.toLowerCase().includes(query) ||
                (car.category && car.category.toLowerCase().includes(query))
            );
        }

        // Category
        if (filters.category !== "all") {
            const targetCategory = filters.category;
            result = result.filter(car => {
                if (!car.category) return false;
                const carCat = car.category.toLowerCase();
                return carCat.includes(targetCategory.toLowerCase());
            });
        }

        // Transmission
        if (filters.transmission !== "all") {
            result = result.filter(car =>
                car.transmission && car.transmission.toLowerCase() === filters.transmission.toLowerCase()
            );
        }

        // Price
        if (filters.minPrice > 0) {
            result = result.filter(car => Number(car.price) >= filters.minPrice);
        }
        if (filters.maxPrice > 0) {
            result = result.filter(car => Number(car.price) <= filters.maxPrice);
        }

        setFilteredCars(result);
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white pb-24 pt-32 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gold-500/10 rounded-full blur-[140px] pointer-events-none"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                {/* Page Title Header */}
                <div className="text-center mb-14">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 font-medium text-xs tracking-wider uppercase mb-3">
                        {dict?.categories?.fleet || "Exclusive Fleet"}
                    </span>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
                        <span className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent">
                            {dict?.cars_page?.title?.split(' ')[0] || "Our"}
                        </span>
                        {' ' + (dict?.cars_page?.title?.substring(dict?.cars_page?.title?.indexOf(' ') + 1) || "Luxury Fleet")}
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto rounded-full mb-4"></div>
                    <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                        {dict?.cars_page?.subtitle || "Choose the perfect car for your trip"}
                    </p>
                </div>

                {/* Filter Section */}
                <CarFilter onFilterChange={handleFilterChange} dict={dict} />

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-700 border-t-gold-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Cars Grid */}
                        {filteredCars.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                {filteredCars.map((car) => (
                                    <CarCard key={car.id} car={car} onBook={handleCarSelect} dict={dict} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-8 max-w-md mx-auto shadow-xl">
                                <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                </svg>
                                <p className="text-xl font-bold text-white mb-2">{dict?.cars_page?.no_results || "No cars found"}</p>
                                <p className="text-slate-400 text-sm mb-6">{dict?.coming_soon?.title || "Try adjusting your filter criteria"}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-950 font-bold rounded-full shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 transition-all cursor-pointer"
                                >
                                    {dict?.cars_page?.reset_filters || "Reset Filters"}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Step 1: Car Details Modal */}
            {isDetailsModalOpen && selectedCar && (
                <CarDetailsModal
                    product={selectedCar}
                    category={{ name: selectedCar.category }}
                    onClose={() => setIsDetailsModalOpen(false)}
                    onOrder={handleProceedToBooking}
                    dict={dict}
                />
            )}

            {/* Step 2: Booking Modal */}
            {isBookingModalOpen && selectedCar && (
                <BookingModal
                    product={selectedCar}
                    category={{ name: selectedCar.category }}
                    onClose={() => setIsBookingModalOpen(false)}
                    onBack={() => {
                        setIsBookingModalOpen(false);
                        setIsDetailsModalOpen(true);
                    }}
                    dict={dict}
                />
            )}
        </main>
    );
}
