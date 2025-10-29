// API Configuration for Operator App
export const API_CONFIG = {
  BASE_URL: 'https://b7qa2tmqhg.execute-api.ap-south-1.amazonaws.com/dev',
  TIMEOUT: 30000,
};

export const API_ENDPOINTS = {
  OPERATOR: {
    LOGIN: '/operator/login',
    GET_TRIPS: '/operator/trips',
    START_TRIP: '/operator/trips/start',
    GET_PASSENGERS: '/operator/trips',
    SUBMIT_REPORT: '/operator/reports',
    UPDATE_GPS: '/operator/gps',
  },
  QR: {
    VALIDATE: '/qr/validate',
  },
};
