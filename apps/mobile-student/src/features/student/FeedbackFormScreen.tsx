import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface FeedbackFormScreenProps {
  onGoBack: () => void;
}

const FeedbackFormScreen: React.FC<FeedbackFormScreenProps> = ({ onGoBack }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Incomplete Form', 'Please fill out both fields.');
      return;
    }
    Alert.alert('Feedback Submitted', 'Thank you for your feedback!');
    onGoBack();
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Icon name="chevron-back" size={24} color="#4a5568" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submit Feedback</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.formCard}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g., Bus cleanliness"
                value={subject}
                onChangeText={setSubject}
            />
            <Text style={styles.label}>Message</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Please provide details here..."
                value={message}
                onChangeText={setMessage}
                multiline
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f7f8fc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: { padding: 5, marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#1a202c' },
  content: { padding: 20 },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FeedbackFormScreen;