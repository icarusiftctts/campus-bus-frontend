// apps/mobile-student/src/App.tsx

import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, View, StyleSheet } from 'react-native';
import { authService, storageService } from './services';

import SplashScreen from './features/auth/SplashScreen';
import LoginScreen from './features/auth/LoginScreen';
import ProfileSetupScreen from './features/student/ProfileSetupScreen';
import HomeDashboard from './features/student/HomeDashboard';
import ProfileScreen from './features/student/ProfileScreen';
import BookingConfirmation from './features/student/BookingConfirmation';
import TripHistoryScreen from './features/student/TripHistoryScreen';
import MyTripScreen from './features/student/MyTripScreen';
import FeedbackFormScreen from './features/student/FeedbackFormScreen';
import CancellationSuccessScreen from './features/student/CancellationSuccessScreen';

interface TripDetails {
  time: string;
  date: string;
  route: 'Campus to City' | 'City to Campus';
  isWaitlist?: boolean;
  busNumber?: string;
  tripId?: string;
}

type AppState = 'SPLASH' | 'AUTH' | 'PROFILE_SETUP' | 'DASHBOARD' | 'PROFILE_SCREEN' | 'BOOKING_CONFIRMATION' | 'TRIP_HISTORY' | 'MY_TRIP' | 'FEEDBACK_FORM' | 'CANCELLATION_SUCCESS';

function App() {
  const [appState, setAppState] = useState<AppState>('SPLASH');
  const [bookedTripDetails, setBookedTripDetails] = useState<TripDetails | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { token } = await storageService.getAuthData();
      if (token) {
        const profile = await authService.validateAndGetProfile();
        if (profile.activeBookings && profile.activeBookings.length > 0) {
          const activeBooking = profile.activeBookings[0];
          setBookedTripDetails({
            time: activeBooking.departureTime,
            date: activeBooking.tripDate,
            route: activeBooking.route === 'CAMPUS_TO_CITY' ? 'Campus to City' : 'City to Campus',
            isWaitlist: activeBooking.status === 'WAITLIST',
            tripId: activeBooking.tripId,
          });
        }
        setAppState(profile.profileComplete ? 'DASHBOARD' : 'PROFILE_SETUP');
      }
    } catch (error) {
      await authService.logout();
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleProceedToLogin = () => setAppState('AUTH');
  const handleLoginSuccess = () => setAppState('PROFILE_SETUP');
  const handleProfileComplete = () => setAppState('DASHBOARD');
  const handleGoToDashboard = () => setAppState('DASHBOARD');
  const handleGoToProfile = () => setAppState('PROFILE_SCREEN');
  const handleLogout = () => setAppState('AUTH');

  const handleBookingSuccess = (tripDetails: TripDetails) => {
    // This function now handles both booking and waitlisting
    setBookedTripDetails(tripDetails);
    setAppState('BOOKING_CONFIRMATION');
  };

  const handleGoToTripHistory = () => {
    setAppState('TRIP_HISTORY');
  };

  const handleGoToMyTrip = () => {
    // Removed the conditional logic.
    // The app will now always navigate to the MyTripScreen.
    setAppState('MY_TRIP');
  };

  const handleGoToFeedback = () => {
    setAppState('FEEDBACK_FORM');
  };

  const handleTripCancellation = () => {
    setBookedTripDetails(null);
    setAppState('CANCELLATION_SUCCESS');
  };

  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  if (appState === 'SPLASH') {
    return <SplashScreen onProceed={handleProceedToLogin} />;
  }

  if (appState === 'AUTH') {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} onGoToDashboard={handleGoToDashboard} />;
  }

  if (appState === 'PROFILE_SETUP') {
    return <ProfileSetupScreen onProfileComplete={handleProfileComplete} />;
  }

  if (appState === 'DASHBOARD') {
    return (
      <HomeDashboard
        onGoToProfile={handleGoToProfile}
        onBookTrip={handleBookingSuccess}
        onGoToMyTrip={handleGoToMyTrip}
        onGoToTripHistory={handleGoToTripHistory}
        onGoToFeedback={handleGoToFeedback}
        onLogout={handleLogout}
      />
    );
  }

  if (appState === 'PROFILE_SCREEN') {
    return <ProfileScreen onGoToDashboard={handleGoToDashboard} onLogout={handleLogout} />;
  }

  if (appState === 'TRIP_HISTORY') {
    return <TripHistoryScreen onGoBack={handleGoToDashboard} />;
  }

  if (appState === 'MY_TRIP') {
    // Pass the bookedTripDetails to the MyTripScreen component
    return <MyTripScreen
              bookedTrip={bookedTripDetails}
              onGoBack={handleGoToDashboard}
              onCancelTrip={handleTripCancellation}
           />;
  }

  if (appState === 'FEEDBACK_FORM') {
    return <FeedbackFormScreen onGoBack={handleGoToDashboard} />;
  }

  if (appState === 'CANCELLATION_SUCCESS') {
    return <CancellationSuccessScreen onGoToDashboard={handleGoToDashboard} />;
  }

  if (appState === 'BOOKING_CONFIRMATION' && bookedTripDetails) {
    return <BookingConfirmation tripDetails={bookedTripDetails} onGoToDashboard={handleGoToDashboard} />;
  }

  return <SplashScreen onProceed={handleProceedToLogin} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
});

export default App;