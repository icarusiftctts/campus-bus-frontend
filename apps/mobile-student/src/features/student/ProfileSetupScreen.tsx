import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// Corrected path:
// From: '../../assets/images/profile-setup.svg' (Incorrect, only two levels up)
// To: '../../../assets/images/profile-setup.svg' (Three levels up: features, student, src)
import profileSetupIllustration from '../../assets/images/profile-setup.png';
import { authService } from '../../services';

interface ProfileSetupScreenProps {
  onProfileComplete: () => void;
  onGoBack?: () => void;
}

const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ onProfileComplete, onGoBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [studentMobile, setStudentMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const data = await authService.getPendingProfileData();
      if (data) {
        setUserData(data);
        setName(data.name || '');
        setEmail(data.email || '');
      }
    };
    loadUserData();
  }, []);

  const handleSubmit = async () => {
    if (!roomNumber || !studentMobile) {
      Alert.alert('Incomplete Form', 'Please fill in all the details.');
      return;
    }

    if (!userData?.studentId) {
      Alert.alert('Error', 'User data not found. Please login again.');
      return;
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(studentMobile)) {
      Alert.alert('Invalid Mobile Number', 'Mobile Number must be exactly 10 digits.');
      return;
    }

    setLoading(true);
    try {
      await authService.completeProfile({
        studentId: userData.studentId,
        room: roomNumber,
        phone: studentMobile,
      });

      await authService.clearPendingProfileData();
      Alert.alert('Success', 'Profile completed successfully!');
      onProfileComplete();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      {onGoBack && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Image
              source={profileSetupIllustration}
              style={styles.illustration}
              resizeMode="contain"
            />
            <Text style={styles.heading}>Complete Your Profile</Text>
            <Text style={styles.subHeading}>Please fill in your details to continue.</Text>

            <View style={styles.form}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={name}
                editable={false}
                placeholderTextColor="#A0AEC0"
              />
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={email}
                editable={false}
                placeholderTextColor="#A0AEC0"
              />
              <Text style={styles.label}>Room Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., A-101"
                value={roomNumber}
                onChangeText={setRoomNumber}
                placeholderTextColor="#A0AEC0"
                editable={!loading}
              />
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="10-digit mobile number"
                value={studentMobile}
                onChangeText={setStudentMobile}
                keyboardType="phone-pad"
                maxLength={10}
                placeholderTextColor="#A0AEC0"
                editable={!loading}
              />

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Saving...' : 'Save & Continue'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 16,
    width: '100%',
    maxWidth: 450,
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    // Shadow for Android
    elevation: 10,
  },
  illustration: {
    width: '60%',
    height: 150,
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 10,
  },
  subHeading: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    marginBottom: 15,
    color: '#2D3748',
  },
  button: {
    marginTop: 15,
    paddingVertical: 14,
    backgroundColor: '#007bff',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2D3748',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ProfileSetupScreen;