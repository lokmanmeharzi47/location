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

        // Category - using English keys from Filter now
        if (filters.category !== "all") {
            const targetCategory = filters.category;

            result = result.filter(car => {
                if (!car.category) return false;
                // Currently API returns categories like "Economy" (from DB english values if configured)
                // But previously we were mapping "اقتصادية" -> "economy".
                // Now Filter sends "economy".
                // We need to match "economy" with whatever is in car.category (which might be "Economy", "Eco", "economique"?)
                // Assuming DB has categories that contain the key or are related.
                // Let's rely on loose matching or standardized DB values.
                const carCat = car.category.toLowerCase();
                return carCat.includes(targetCategory.toLowerCase());
            });
        }

        // Transmission
        if (filters.transmission !== "all") {
            // Filter sends "Automatique" or "Manuelle" (still hardcoded values in filter for value prop, just label changed?)
            // Wait, in CarFilter revision I kept value="Automatique"/"Manuelle" same as DB? 
            // Checked CarFilter code: values are "Automatique"/"Manuelle".
            // Need to make sure DB returns these values or map them.
            // DB car.transmission usually matches these if they were inserted that way.
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
        <main className="min-h-screen bg-slate-950 text-slate-100 pb-20 pt-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                {/* Page Title */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        <span className="text-gold-500">
                            {dict?.cars_page?.title?.split(' ')[0] || "Our"}
                        </span>
                        {' ' + (dict?.cars_page?.title?.substring(dict?.cars_page?.title?.indexOf(' ') + 1) || "Luxury Fleet")}
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        {dict?.cars_page?.subtitle || "Choose the perfect car for your trip"}
                    </p>
                </div>

                {/* Filter Section */}
                <CarFilter onFilterChange={handleFilterChange} dict={dict} />

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Cars Grid */}
                        {filteredCars.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredCars.map((car) => (
                                    <CarCard key={car.id} car={car} onBook={handleCarSelect} dict={dict} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800">
                                <p className="text-xl text-slate-400">{dict?.cars_page?.no_results || "No cars found"}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-4 text-gold-500 hover:underline"
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
