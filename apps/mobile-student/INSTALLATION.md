# Installation Instructions for API Integration

## Required Dependency

The API integration requires AsyncStorage for token management.

### Install AsyncStorage

```bash
cd /home/praneeldev/Projects/CampusBusBooking/campus-bus-app/BUS/apps/mobile-student
npm install @react-native-async-storage/async-storage
```

### For Expo Projects (if using Expo)
```bash
npx expo install @react-native-async-storage/async-storage
```

## Configuration Steps

### 1. Update API Base URL
After deploying the backend to AWS, update the API Gateway URL in:
```
src/services/api.config.ts
```

Change this line:
```typescript
BASE_URL: 'https://your-api-id.execute-api.ap-south-1.amazonaws.com/dev',
```

To your actual API Gateway URL (found in AWS Console after deployment).

### 2. Verify Installation
Run the app to ensure no import errors:
```bash
npm start
```

## Files Modified

### New Files Created
- `src/services/api.config.ts` - API configuration
- `src/services/api.types.ts` - TypeScript types
- `src/services/api.client.ts` - HTTP client
- `src/services/auth.service.ts` - Auth service
- `src/services/trip.service.ts` - Trip service
- `src/services/booking.service.ts` - Booking service
- `src/services/index.ts` - Service exports

### Existing Files Modified
- `src/features/auth/LoginScreen.tsx` - Added API integration
- `src/features/student/HomeDashboard.tsx` - Added trip fetching and booking
- `src/features/student/BookingModal.tsx` - Added loading state

## Testing Without Backend

The app will show errors when trying to connect to the API if the backend is not deployed. To test the UI without backend:

1. Keep the dev buttons in LoginScreen for navigation
2. Comment out API calls temporarily
3. Use mock data for testing UI flows

## Next Steps After Installation

1. Deploy backend Lambda functions to AWS
2. Configure API Gateway
3. Update `api.config.ts` with real URL
4. Test authentication flow
5. Test trip booking flow
6. Remove dev navigation buttons from LoginScreen

## Troubleshooting

### AsyncStorage Import Error
If you see "Cannot find module '@react-native-async-storage/async-storage'":
- Ensure you ran `npm install` in the correct directory
- Try clearing cache: `npm start -- --reset-cache`
- For Expo: `npx expo start -c`

### API Connection Timeout
If requests timeout:
- Verify API Gateway URL is correct
- Check AWS Lambda functions are deployed
- Verify CORS is configured in API Gateway
- Check network connectivity

### TypeScript Errors
If you see TypeScript errors:
- Run `npm install` to ensure all types are installed
- Restart TypeScript server in your IDE
- Check `tsconfig.json` includes `src/services/**/*`
