import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import all of your screen components
import SplashScreen from './src/features/auth/SplashScreen';
import OperatorLoginScreen from './src/features/auth/OperatorLoginScreen';
import BusSelectionScreen from './src/features/auth/BusSelectionScreen';
import ScannerScreen from './src/features/operation/ScannerScreen';
import PassengerListScreen from './src/features/operation/PassengerListScreen';

// Create a Stack Navigator
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  // State management remains the same
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingInitialData(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Handler functions remain the same
  const handleProceedFromSplash = () => setShowSplash(false);
  const handleLoginSuccess = () => setIsLoggedIn(true);
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentTripId(null);
  };
  const handleStartScanning = (tripId: string) => setCurrentTripId(tripId);

  // This function is now passed to the ScannerScreen to handle ending a shift
  const handleEndShift = () => setCurrentTripId(null);

  // --- RENDERING LOGIC ---

  // 1. Show Splash Screen (this remains outside the navigator)
  if (isLoadingInitialData || showSplash) {
    return <SplashScreen onProceed={handleProceedFromSplash} />;
  }

  // 2. Use NavigationContainer and Stack.Navigator for all other screens
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          // --- AUTH FLOW ---
          // If the user is not logged in, only the Login screen is available.
          <Stack.Screen name="Login">
            {(props) => (
              <OperatorLoginScreen
                {...props}
                onLoginSuccess={handleLoginSuccess}
                onGoToDashboard={handleLoginSuccess}
              />
            )}
          </Stack.Screen>
        ) : !currentTripId ? (
          // --- BUS SELECTION FLOW ---
          // If logged in but no trip is active, show the Bus Selection screen.
          <Stack.Screen name="BusSelection">
            {(props) => (
              <BusSelectionScreen
                {...props}
                onStartScanning={handleStartScanning}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
        ) : (
          // --- OPERATIONAL FLOW ---
          // If a trip is active, make the Scanner and Passenger List screens available.
          <>
            <Stack.Screen
              name="Scanner"
              component={ScannerScreen}
              // Pass initial data to the Scanner screen
              initialParams={{ tripId: currentTripId, onEndShift: handleEndShift }}
            />
            <Stack.Screen
              name="PassengerList"
              component={PassengerListScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;