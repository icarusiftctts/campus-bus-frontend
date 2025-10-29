import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

// Corrected path:
// From: '../../assets/images/collegeLogo.png'
// To: '../../../assets/images/collegeLogo.png' (3 levels up: features, auth, src)
import collegeLogo from '../../assets/images/collegeLogo.png';

// Define a type for the component's props.
// This tells TypeScript that 'onProceed' is a function that takes no arguments and returns nothing.
interface SplashScreenProps {
  onProceed: () => void;
}

// Apply the props type to the component using React.FC (Functional Component).
const SplashScreen: React.FC<SplashScreenProps> = ({ onProceed }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={collegeLogo} style={styles.logo} />
        <Text style={styles.heading}>Campus Connect</Text>
        <TouchableOpacity style={styles.button} onPress={onProceed}>
          <Text style={styles.buttonText}>Proceed to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    color: '#343a40',
    // Note: For custom fonts in React Native, ensure they are linked in your project.
    // fontFamily: 'Poppins-SemiBold',
  },
  button: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#007bff',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    // fontFamily: 'Poppins-SemiBold',
  },
});

export default SplashScreen;