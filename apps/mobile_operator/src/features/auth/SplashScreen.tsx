// apps/mobile-operator/src/features/auth/SplashScreen.tsx

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// CORRECTED PATH: Go up two levels (auth -> features -> src)
import operatorLogo from '../../assets/images/operatorLogo.png';

// Define a type for the component's props.
interface SplashScreenProps {
  onProceed: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onProceed }) => {
  return (
    // Outer View to ensure the background color covers the entire native screen
    <View style={styles.rootBackground}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Image source={operatorLogo} style={styles.logo} />
          <Text style={styles.heading}>Operator Connect</Text>
          <TouchableOpacity style={styles.button} onPress={onProceed}>
            <Text style={styles.buttonText}>Start Shift</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootBackground: {
    flex: 1,
    backgroundColor: '#ebf4ff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  heading: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1a202c',
  },
  button: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#38A169',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default SplashScreen;