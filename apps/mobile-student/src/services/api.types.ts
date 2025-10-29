// TypeScript interfaces for API requests and responses

// Auth Types
export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  room: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  studentId: string;
  email: string;
  name: string;
  message: string;
}

// Trip Types
export interface Trip {
  tripId: string;
  route: 'CAMPUS_TO_CITY' | 'CITY_TO_CAMPUS';
  destination: string;
  busNumber: string;
  dayType: 'WEEKDAY' | 'WEEKEND';
  tripDate: string; // YYYY-MM-DD
  departureTime: string; // HH:mm
  capacity: number;
  facultyReserved: number;
  bookedCount: number;
  waitlistCount: number;
  availableSeats: number;
  status?: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
}

export interface GetTripsRequest {
  route: 'CAMPUS_TO_CITY' | 'CITY_TO_CAMPUS';
  tripDate: string; // YYYY-MM-DD
}

// Booking Types
export interface BookTripRequest {
  tripId: string;
}

export interface BookingResponse {
  bookingId: string;
  tripId?: string;
  status: 'CONFIRMED' | 'WAITLIST';
  position?: number;
  qrToken?: string;
  message: string;
}

export interface CancelBookingRequest {
  bookingId: string;
}

// Google Auth Types
export interface GoogleAuthRequest {
  googleToken: string;
  email: string;
  name: string;
}

export interface GoogleAuthResponse {
  studentId: string;
  token: string;
  isNewUser: boolean;
  profileComplete: boolean;
  name: string;
  email: string;
  room?: string;
  phone?: string;
}

export interface CompleteProfileRequest {
  studentId: string;
  room: string;
  phone: string;
}

export interface CompleteProfileResponse {
  message: string;
  profileComplete: boolean;
}

// API Error Response
export interface ApiError {
  message: string;
  statusCode?: number;
}
