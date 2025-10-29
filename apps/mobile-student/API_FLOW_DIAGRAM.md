# API Integration Flow Diagram

## Authentication Flow

```
┌─────────────────┐
│  LoginScreen    │
│  (User enters   │
│  email/password)│
└────────┬────────┘
         │
         │ authService.login({ email, password })
         ▼
┌─────────────────┐
│  auth.service   │
│  .login()       │
└────────┬────────┘
         │
         │ POST /api/auth/login
         ▼
┌─────────────────┐
│  api.client     │
│  .post()        │
└────────┬────────┘
         │
         │ HTTP Request with body
         ▼
┌─────────────────────────────────┐
│  AWS API Gateway                │
│  POST /api/auth/login           │
└────────┬────────────────────────┘
         │
         │ Invoke Lambda
         ▼
┌─────────────────────────────────┐
│  LoginUserHandler (Lambda)      │
│  - Validates with AWS Cognito   │
│  - Generates JWT token          │
│  - Returns user data            │
└────────┬────────────────────────┘
         │
         │ Response: { token, studentId, email, name }
         ▼
┌─────────────────┐
│  api.client     │
│  .setToken()    │
└────────┬────────┘
         │
         │ Store in AsyncStorage
         ▼
┌─────────────────┐
│  AsyncStorage   │
│  key: auth_token│
└────────┬────────┘
         │
         │ Success callback
         ▼
┌─────────────────┐
│  LoginScreen    │
│  Navigate to    │
│  Dashboard      │
└─────────────────┘
```

## Trip Fetching Flow

```
┌─────────────────┐
│ HomeDashboard   │
│ useEffect()     │
│ [route, date]   │
└────────┬────────┘
         │
         │ tripService.getTripsForDate(route, daysFromNow)
         ▼
┌─────────────────┐
│  trip.service   │
│  .getTripsFor   │
│  Date()         │
└────────┬────────┘
         │
         │ Calculate date, format params
         ▼
┌─────────────────┐
│  trip.service   │
│  .getAvailable  │
│  Trips()        │
└────────┬────────┘
         │
         │ GET /api/trips/available?route=X&tripDate=Y
         ▼
┌─────────────────┐
│  api.client     │
│  .get()         │
└────────┬────────┘
         │
         │ Add Authorization: Bearer {token}
         ▼
┌─────────────────────────────────┐
│  AWS API Gateway                │
│  GET /api/trips/available       │
│  + Cognito Authorizer           │
└────────┬────────────────────────┘
         │
         │ Validate token, invoke Lambda
         ▼
┌─────────────────────────────────┐
│  GetAvailableTripsHandler       │
│  - Query MySQL database         │
│  - Join bookings table          │
│  - Calculate availability       │
└────────┬────────────────────────┘
         │
         │ Response: Trip[] with availability
         ▼
┌─────────────────┐
│  trip.service   │
│  .transformTrip │
│  ForUI()        │
└────────┬────────┘
         │
         │ Convert 24h→12h time, calculate seats
         ▼
┌─────────────────┐
│ HomeDashboard   │
│ setTrips()      │
│ Render TripCard │
└─────────────────┘
```

## Booking Flow

```
┌─────────────────┐
│ HomeDashboard   │
│ User clicks     │
│ TripCard        │
└────────┬────────┘
         │
         │ handleTripPress(trip)
         ▼
┌─────────────────┐
│ BookingModal    │
│ Shows trip      │
│ details         │
└────────┬────────┘
         │
         │ User clicks "Confirm Booking"
         ▼
┌─────────────────┐
│ HomeDashboard   │
│ handleConfirm   │
│ Booking()       │
└────────┬────────┘
         │
         │ bookingService.bookTrip(tripId)
         ▼
┌─────────────────┐
│ booking.service │
│ .bookTrip()     │
└────────┬────────┘
         │
         │ POST /api/bookings { tripId }
         ▼
┌─────────────────┐
│  api.client     │
│  .post()        │
└────────┬────────┘
         │
         │ Add Authorization: Bearer {token}
         ▼
┌─────────────────────────────────┐
│  AWS API Gateway                │
│  POST /api/bookings             │
│  + Cognito Authorizer           │
└────────┬────────────────────────┘
         │
         │ Validate token, invoke Lambda
         ▼
┌─────────────────────────────────┐
│  BookTripHandler (Lambda)       │
│  1. Acquire Redis lock          │
│  2. Check student penalty       │
│  3. Count available seats       │
│  4. Create booking or waitlist  │
│  5. Generate QR token           │
│  6. Release Redis lock          │
└────────┬────────────────────────┘
         │
         │ Response: { bookingId, status, qrToken, message }
         ▼
┌─────────────────┐
│ HomeDashboard   │
│ Show Alert      │
│ - "Confirmed!"  │
│ - "Waitlist #3" │
└────────┬────────┘
         │
         │ fetchTrips() - refresh availability
         ▼
┌─────────────────┐
│ HomeDashboard   │
│ Updated trip    │
│ availability    │
└─────────────────┘
```

## Token Flow (All Authenticated Requests)

```
┌─────────────────┐
│  Any Component  │
│  calls service  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Service Layer  │
│  (auth/trip/    │
│   booking)      │
└────────┬────────┘
         │
         │ Calls api.client method
         ▼
┌─────────────────┐
│  api.client     │
│  .request()     │
└────────┬────────┘
         │
         │ if requiresAuth = true
         ▼
┌─────────────────┐
│  api.client     │
│  .getToken()    │
└────────┬────────┘
         │
         │ Read from AsyncStorage
         ▼
┌─────────────────┐
│  AsyncStorage   │
│  getItem(       │
│  'auth_token')  │
└────────┬────────┘
         │
         │ Returns token
         ▼
┌─────────────────┐
│  api.client     │
│  Add header:    │
│  Authorization: │
│  Bearer {token} │
└────────┬────────┘
         │
         │ Send HTTP request
         ▼
┌─────────────────────────────────┐
│  AWS API Gateway                │
│  Cognito Authorizer validates   │
│  token before invoking Lambda   │
└─────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────┐
│  Component      │
│  try-catch      │
└────────┬────────┘
         │
         │ await service.method()
         ▼
┌─────────────────┐
│  Service Layer  │
└────────┬────────┘
         │
         │ await api.client.method()
         ▼
┌─────────────────┐
│  api.client     │
│  fetch()        │
└────────┬────────┘
         │
         ├─── Success (200-299)
         │    │
         │    ▼
         │    Return data to component
         │
         ├─── HTTP Error (400, 401, 500, etc.)
         │    │
         │    ▼
         │    throw { message, statusCode }
         │
         └─── Network Error / Timeout
              │
              ▼
              throw { message: 'Request timeout', statusCode: 408 }
         
         │
         │ Error propagates up
         ▼
┌─────────────────┐
│  Component      │
│  catch (error)  │
│  Alert.alert()  │
└─────────────────┘
```

## Data Transformation Example

```
Backend Response (GetAvailableTripsHandler):
┌─────────────────────────────────────────┐
│ {                                       │
│   tripId: "T12AB34CD",                  │
│   route: "CAMPUS_TO_CITY",              │
│   tripDate: "2024-10-15",               │
│   departureTime: "17:30",               │
│   capacity: 35,                         │
│   facultyReserved: 5,                   │
│   bookedCount: 20,                      │
│   waitlistCount: 3,                     │
│   status: "ACTIVE"                      │
│ }                                       │
└─────────────────────────────────────────┘
         │
         │ tripService.transformTripForUI()
         ▼
Frontend Format (HomeDashboard):
┌─────────────────────────────────────────┐
│ {                                       │
│   id: "T12AB34CD",                      │
│   time: "5:30 PM",                      │
│   availableSeats: 10,                   │
│   totalSeats: 30,                       │
│   status: "Booking Open",               │
│   waitlistCount: 3,                     │
│   tripId: "T12AB34CD",                  │
│   route: "CAMPUS_TO_CITY",              │
│   tripDate: "2024-10-15",               │
│   departureTime: "17:30"                │
│ }                                       │
└─────────────────────────────────────────┘

Calculations:
- availableSeats = capacity - facultyReserved - bookedCount
                 = 35 - 5 - 20 = 10
- totalSeats = capacity - facultyReserved
             = 35 - 5 = 30
- time = formatTime("17:30") = "5:30 PM"
- status = availableSeats > 0 ? "Booking Open" : "Bus Full"
```

## File Structure Overview

```
src/
├── services/                    ← NEW: API Service Layer
│   ├── api.config.ts           ← Endpoints & base URL
│   ├── api.types.ts            ← TypeScript interfaces
│   ├── api.client.ts           ← HTTP client + token mgmt
│   ├── auth.service.ts         ← Login/Register/Logout
│   ├── trip.service.ts         ← Fetch & transform trips
│   ├── booking.service.ts      ← Book/Cancel trips
│   └── index.ts                ← Export all services
│
├── features/
│   ├── auth/
│   │   └── LoginScreen.tsx     ← UPDATED: API integration
│   └── student/
│       ├── HomeDashboard.tsx   ← UPDATED: Fetch trips, book
│       └── BookingModal.tsx    ← UPDATED: Loading state
│
└── components/
    └── ...                      ← Unchanged
```

## Summary of API Calls

| Component | Service Method | HTTP Method | Endpoint | Lambda Handler |
|-----------|---------------|-------------|----------|----------------|
| LoginScreen | `authService.login()` | POST | `/api/auth/login` | LoginUserHandler |
| HomeDashboard | `tripService.getTripsForDate()` | GET | `/api/trips/available` | GetAvailableTripsHandler |
| HomeDashboard | `bookingService.bookTrip()` | POST | `/api/bookings` | BookTripHandler |

All authenticated requests automatically include:
- Header: `Authorization: Bearer {jwt_token}`
- Token retrieved from AsyncStorage
- Token validated by AWS Cognito Authorizer in API Gateway
