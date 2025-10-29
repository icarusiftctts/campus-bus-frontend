import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { API_CONFIG } from '../../services/api.config';

GoogleSignin.configure({
  webClientId: API_CONFIG.GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});

// Corrected paths (3 levels up: features, auth, src):
// @ts-ignore
import collegeLogo from '../../assets/images/collegeLogo.png';
// @ts-ignore
import busIcon from '../../assets/images/busIcon.png';

// API Service - connects to LoginUserHandler
import { authService } from '../../services';


interface LoginScreenProps {
  onLoginSuccess: () => void;
  onGoToDashboard: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onGoToDashboard }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  const isValidCollegeEmail = (email: string): boolean => {
    return email.toLowerCase().endsWith(API_CONFIG.ALLOWED_DOMAIN);
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (!isValidCollegeEmail(email)) {
      Alert.alert('Invalid Email', `Only ${API_CONFIG.ALLOWED_DOMAIN} emails are allowed`);
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      Alert.alert('Success', response.message || 'Login successful!');
      onGoToDashboard();
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (!isValidCollegeEmail(userInfo.data.user.email)) {
        Alert.alert(
          'Invalid Email',
          `Only ${API_CONFIG.ALLOWED_DOMAIN} emails are allowed`
        );
        await GoogleSignin.signOut();
        return;
      }
      
      const tokens = await GoogleSignin.getTokens();
      
      const response = await authService.googleAuth({
        googleToken: tokens.idToken,
        email: userInfo.data.user.email,
        name: userInfo.data.user.name || userInfo.data.user.email,
      });

      if (!response.profileComplete) {
        onLoginSuccess();
      } else {
        onGoToDashboard();
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      Alert.alert('Login Failed', error.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.card}>
        {/* The size of this image is controlled by styles.logo */}
        <Image source={collegeLogo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.welcomeHeading}>WELCOME</Text>

        <Image
          source={busIcon}
          style={styles.busIcon}
          resizeMode="contain"
        />

        <Text style={styles.subheading}>Get on Board</Text>

        {!showEmailLogin ? (
          <>
            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <View style={styles.googleIconContainer}>
                    <Icon name="google" size={20} color="#4285F4" />
                  </View>
                  <Text style={styles.loginButtonText}>Sign in with Google</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowEmailLogin(true)} style={styles.emailToggle}>
              <Text style={styles.emailToggleText}>Or use email/password (Dev)</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emailForm}>
            <TextInput
              style={styles.input}
              placeholder="College Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowEmailLogin(false)} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back to Google</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.devButtonsContainer}>
          <TouchableOpacity style={styles.devButton} onPress={onLoginSuccess}>
            <Text style={styles.devButtonText}>(Dev: Go to Profile Setup)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.devButton} onPress={onGoToDashboard}>
            <Text style={styles.devButtonText}>(Dev: Go to Dashboard)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  card: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 40,
    paddingHorizontal: 30,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    // Shadow for Android
    elevation: 10,
  },
  logo: {
    // INCREASED LOGO SIZE
    height: 80, // Increased from 45
    width: '60%', // Increased from 50%
    marginBottom: 40,
  },
  welcomeHeading: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 20,
  },
  busIcon: {
    width: 200,
    height: 150,
    marginBottom: 30,
    zIndex: 1,
  },
  illustration: {
    width: '80%',
    height: 200,
    marginBottom: 40,
  },
  subheading: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 30,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 340,
    paddingVertical: 12,
    backgroundColor: '#4285F4',
    borderRadius: 9999, // Full pill shape
    shadowColor: 'rgba(0, 118, 255, 0.39)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  googleIconContainer: {
    marginRight: 12,
    backgroundColor: 'white',
    padding: 6,
    borderRadius: 9999,
  },
  devButtonsContainer: {
    marginTop: 20,
    gap: 10,
    width: '100%',
    maxWidth: 340,
  },
  devButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#6c757d',
    borderRadius: 6,
    alignItems: 'center',
  },
  devButtonText: {
    color: 'white',
    fontSize: 14,
  },
  emailToggle: {
    marginTop: 15,
  },
  emailToggleText: {
    color: '#007bff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  emailForm: {
    width: '100%',
    maxWidth: 340,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  backButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6c757d',
    fontSize: 14,
  },
});

export default LoginScreen;