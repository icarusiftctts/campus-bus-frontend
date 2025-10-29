// API Configuration - Base URL and Endpoints
// Maps to API Gateway endpoints defined in booking-system/API_GATEWAY_SETUP.md

export const API_CONFIG = {
  BASE_URL: 'https://b7qa2tmqhg.execute-api.ap-south-1.amazonaws.com/dev',
  TIMEOUT: 30000,
  GOOGLE_WEB_CLIENT_ID: '1069892057411-n01aisa2nspviqrqaam9vqm9ak1n9dhc.apps.googleusercontent.com',
  ALLOWED_DOMAIN: '@lnmiit.ac.in',
};

// API Endpoints mapping to Lambda handlers
export const API_ENDPOINTS = {
  // Auth endpoints - No authorization required
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    GOOGLE_AUTH: '/auth/google',
    COMPLETE_PROFILE: '/auth/complete-profile',
  },
  
  // Trip endpoints - Requires Bearer token
  TRIPS: {
    AVAILABLE: '/trips/available', // → GetAvailableTripsHandler (GET with query params)
    CREATE: '/trips',              // → CreateTripHandler (Admin only)
  },
  
  // Booking endpoints - Requires Bearer token
  BOOKINGS: {
    CREATE: '/bookings',           // → BookTripHandler
    CANCEL: '/bookings',           // → CancelBookingHandler (DELETE /{bookingId})
    HISTORY: '/bookings/history',  // → GetStudentBookingsHandler
  },
  
  // Profile endpoints - Requires Bearer token
  PROFILE: {
    GET: '/profile',               // → GetUserProfileHandler
  },
  
  // QR Code endpoints - Requires Operator token
  QR: {
    VALIDATE: '/qr/validate',      // → ValidateQRHandler
  },
};
