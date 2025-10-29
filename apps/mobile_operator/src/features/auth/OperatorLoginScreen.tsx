import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import { operatorService } from '../../services';
import operatorLogo from '../../assets/images/operatorLogo.png';
import busStopIcon from '../../assets/images/busStopIcon.png';

interface OperatorLoginScreenProps {
  onLoginSuccess: () => void;
}

const OperatorLoginScreen: React.FC<OperatorLoginScreenProps> = ({ onLoginSuccess }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginClick = async () => {
    if (!employeeId || !password) {
      Alert.alert('Validation Error', 'Please enter both Employee ID and Password');
      return;
    }

    setLoading(true);
    try {
      const response = await operatorService.login(employeeId, password);
      Alert.alert('Success', `Welcome, ${response.name}!`);
      onLoginSuccess();
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    // We only need the SafeAreaView, as the root background is managed by AppNavigator/SplashScreen
    <SafeAreaView style={styles.page}>
      <View style={styles.card}>
        {/* Logo/Branding */}
        <Image source={operatorLogo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.welcomeHeading}>OPERATOR LOGIN</Text>

        {/* Main Illustration/Icon */}
        <Image
          source={busStopIcon}
          style={styles.busIcon} // Changed to busIcon for consistency with student screen styles
          resizeMode="contain"
        />

        <Text style={styles.subheading}>Ready for the Route</Text>

        {/* Manual Sign-In Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Icon name="user" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Employee ID"
              placeholderTextColor="#9CA3AF"
              value={employeeId}
              onChangeText={setEmployeeId}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Icon name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
          onPress={handleLoginClick}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // *** REMOVED rootBackground STYLE ***

  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ebf4ff', // Light background color for this view
  },
  card: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 40,
    paddingHorizontal: 30,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    // Shadow (using operator theme)
    shadowColor: '#1A4D2E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  logo: {
    height: 80,
    width: '60%',
    marginBottom: 30,
  },
  welcomeHeading: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1a202c',
    marginBottom: 10,
  },
  busIcon: { // Renamed from mainIcon to match student's key
    width: 180,
    height: 130,
    marginBottom: 30,
    marginTop: 10,
    zIndex: 1,
  },
  subheading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 30,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 50,
    color: '#1A202C',
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    maxWidth: 340,
    paddingVertical: 14,
    backgroundColor: '#38A169',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default OperatorLoginScreen;
