# API Integration Guide

## Overview
This document describes the API integration between the React Native frontend and AWS Lambda backend.

## Setup Instructions

### 1. Install Required Dependencies
```bash
cd /home/praneeldev/Projects/CampusBusBooking/campus-bus-app/BUS/apps/mobile-student
npm install @react-native-async-storage/async-storage
```

### 2. Configure API Base URL
Edit `src/services/api.config.ts` and replace the placeholder URL with your actual API Gateway URL:
```typescript
BASE_URL: 'https://your-actual-api-id.execute-api.ap-south-1.amazonaws.com/dev'
```

## Service Layer Architecture

### Files Created
```
src/services/
├── api.config.ts       # API endpoints and configuration
├── api.types.ts        # TypeScript interfaces
├── api.client.ts       # HTTP client with auth
├── auth.service.ts     # Authentication service
├── trip.service.ts     # Trip management service
├── booking.service.ts  # Booking service
└── index.ts           # Exports
```

## API Endpoint Mappings

### Authentication
| Frontend Method | API Endpoint | Lambda Handler | Description |
|----------------|--------------|----------------|-------------|
| `authService.register()` | POST `/api/auth/register` | RegisterUserHandler | Create new user account |
| `authService.login()` | POST `/api/auth/login` | LoginUserHandler | Login with email/password |

### Trips
| Frontend Method | API Endpoint | Lambda Handler | Description |
|----------------|--------------|----------------|-------------|
| `tripService.getAvailableTrips()` | GET `/api/trips/available` | GetAvailableTripsHandler | Fetch trips by route and date |

### Bookings
| Frontend Method | API Endpoint | Lambda Handler | Description |
|----------------|--------------|----------------|-------------|
| `bookingService.bookTrip()` | POST `/api/bookings` | BookTripHandler | Book a trip or join waitlist |
| `bookingService.cancelBooking()` | DELETE `/api/bookings/{id}` | CancelBookingHandler | Cancel existing booking |

## Component Integration

### LoginScreen.tsx
- **API Call**: `authService.login()`
- **Endpoint**: POST `/api/auth/login` → LoginUserHandler
- **Features**:
  - Email/password authentication
  - Token storage via AsyncStorage
  - Error handling with user alerts
  - Loading state during API call

### HomeDashboard.tsx
- **API Calls**:
  1. `tripService.getTripsForDate()` → GET `/api/trips/available` → GetAvailableTripsHandler
  2. `bookingService.bookTrip()` → POST `/api/bookings` → BookTripHandler
- **Features**:
  - Auto-fetch trips on route/date change
  - Real-time availability display
  - Booking confirmation with waitlist support
  - Loading states and error handling
  - Auto-refresh after booking

### BookingModal.tsx
- **Updated**: Added loading state prop
- **Features**:
  - Disabled buttons during API call
  - Activity indicator during booking
  - Supports both regular booking and waitlist

## Data Transformation

### Backend → Frontend Trip Format
Backend returns:
```json
{
  "tripId": "T12AB34CD",
  "route": "CAMPUS_TO_CITY",
  "tripDate": "2024-10-15",
  "departureTime": "17:30",
  "capacity": 35,
  "facultyReserved": 5,
  "bookedCount": 20,
  "waitlistCount": 3
}
```

Frontend transforms to:
```javascript
{
  id: "T12AB34CD",
  time: "5:30 PM",
  availableSeats: 10,  // capacity - facultyReserved - bookedCount
  totalSeats: 30,      // capacity - facultyReserved
  status: "Booking Open",
  waitlistCount: 3,
  tripId: "T12AB34CD",
  route: "CAMPUS_TO_CITY",
  tripDate: "2024-10-15",
  departureTime: "17:30"
}
```

## Authentication Flow

1. User enters email/password in LoginScreen
2. `authService.login()` calls POST `/api/auth/login`
3. Backend validates credentials via AWS Cognito
4. Backend returns JWT token + user details
5. Token stored in AsyncStorage via `apiClient.setToken()`
6. All subsequent API calls include `Authorization: Bearer {token}` header
7. On logout, token cleared via `authService.logout()`

## Error Handling

All services use try-catch blocks with user-friendly alerts:
```typescript
try {
  const response = await authService.login({ email, password });
  // Success handling
} catch (error: any) {
  Alert.alert('Error', error.message || 'Operation failed');
}
```

## Testing Checklist

### Before Backend Deployment
- [x] Service files created
- [x] Components updated with API calls
- [x] TypeScript interfaces defined
- [x] Error handling implemented
- [x] Loading states added

### After Backend Deployment
- [ ] Update `api.config.ts` with real API Gateway URL
- [ ] Install AsyncStorage dependency
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test trip fetching
- [ ] Test booking creation
- [ ] Test waitlist functionality
- [ ] Test error scenarios (invalid credentials, network timeout)
- [ ] Verify token persistence across app restarts

## Known Issues & TODOs

### Authentication Mismatch
- **Issue**: Frontend has Google OAuth button, backend uses Cognito email/password
- **Solution**: Either implement Google OAuth in backend OR replace Google button with email/password form
- **Status**: Email/password form added as alternative

### Missing Features
- [ ] Profile setup after registration
- [ ] QR code display after booking
- [ ] Trip cancellation UI
- [ ] Real-time bus tracking integration
- [ ] Push notifications setup

## Environment Variables (Future)
Consider moving sensitive config to environment variables:
```typescript
// .env
API_BASE_URL=https://your-api-id.execute-api.ap-south-1.amazonaws.com/dev
API_TIMEOUT=30000
```

## Security Notes
- JWT tokens stored in AsyncStorage (encrypted on device)
- All API calls use HTTPS
- Tokens included in Authorization header
- No sensitive data logged to console in production
- API Gateway enforces CORS policies
