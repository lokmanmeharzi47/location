export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | string;
export type PaymentStatus = 'unpaid' | 'paid' | 'partial' | string;

export interface Booking {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress?: string | null;
  customerCity?: string | null;
  licenseNumber?: string | null;
  carId: number;
  pickupDate: Date;
  returnDate: Date;
  pickupLocation?: string | null;
  returnLocation?: string | null;
  dailyRate: number | string;
  totalDays: number;
  subtotal: number | string;
  extrasAmount?: number | string | null;
  discountAmount?: number | string | null;
  totalAmount: number | string;
  status?: BookingStatus | null;
  paymentStatus?: PaymentStatus | null;
  notes?: string | null;
  extras?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}
