export type CarTransmission = 'Automatique' | 'Manuelle' | string;
export type CarFuelType = 'Essence' | 'Diesel' | 'Hybride' | 'Electrique' | string;
export type CarStatus = 'disponible' | 'loue' | 'maintenance' | string;

export interface Car {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  categoryId?: number | null;
  pricePerDay: number | string;
  pricePerWeek?: number | string | null;
  pricePerMonth?: number | string | null;
  fuelType?: CarFuelType | null;
  transmission?: CarTransmission | null;
  seats?: number | null;
  doors?: number | null;
  luggage?: number | null;
  airConditioning?: boolean | null;
  status?: CarStatus | null;
  licensePlate?: string | null;
  mileage?: number | null;
  imagePath?: string | null;
  images?: string | null;
  description?: string | null;
  features?: string | null;
  displayOrder?: number | null;
  isActive?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
