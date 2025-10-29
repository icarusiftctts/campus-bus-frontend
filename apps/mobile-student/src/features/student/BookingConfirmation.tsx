// features/student/BookingConfirmation.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// --- PROPS INTERFACE (Updated) ---
interface BookingConfirmationProps {
  tripDetails: {
    time: string;
    date: string;
    route: 'Campus to City' | 'City to Campus';
    isWaitlist?: boolean; // Flag to check if this is a waitlist confirmation
  };
  onGoToDashboard: () => void;
}

// --- MAIN COMPONENT (Updated) ---
const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ tripDetails, onGoToDashboard }) => {
  // Check if this is for a waitlist
  const isWaitlist = tripDetails.isWaitlist;

  return (
    <Modal
      transparent
      visible={true}
      onRequestClose={onGoToDashboard}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            {/* DYNAMIC ICON & COLOR */}
            <Icon
              name={isWaitlist ? "time" : "checkmark-circle"}
              size={100}
              color={isWaitlist ? "#fd7e14" : "#28a745"}
            />
          </View>

          {/* DYNAMIC TITLE */}
          <Text style={styles.title}>
            {isWaitlist ? 'You are on the Waitlist!' : 'Booking Confirmed!'}
          </Text>
          {/* DYNAMIC SUBTITLE */}
          <Text style={styles.subtitle}>
            {isWaitlist
              ? 'We will notify you if a seat becomes available for this trip.'
              : 'Your seat has been successfully reserved.'}
          </Text>

          <View style={styles.detailsContainer}>
            <Text style={styles.detailsHeader}>TRIP DETAILS</Text>
            <View style={styles.detailRow}>
              <Icon name="navigate-circle-outline" size={20} color="#4A5568" style={styles.detailIcon} />
              <Text style={styles.detailText}>{tripDetails.route}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="calendar-outline" size={20} color="#4A5568" style={styles.detailIcon} />
              <Text style={styles.detailText}>{tripDetails.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="time-outline" size={20} color="#4A5568" style={styles.detailIcon} />
              <Text style={styles.detailText}>{tripDetails.time}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={onGoToDashboard}>
            <Text style={styles.doneButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 30,
  },
  detailsContainer: {
    backgroundColor: '#f7f8fc',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailsHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0AEC0',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailIcon: {
    marginRight: 15,
  },
  detailText: {
    fontSize: 16,
    color: '#2D3748',
  },
  doneButton: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#007bff',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default BookingConfirmation;