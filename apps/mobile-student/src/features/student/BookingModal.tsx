// features/student/BookingModal.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// --- PROPS INTERFACE (Updated) ---
interface BookingModalProps {
  visible: boolean;
  tripDetails: {
    time: string;
    date: string;
    route: 'Campus to City' | 'City to Campus';
    isWaitlist?: boolean; // Flag to indicate if this is a waitlist action
  } | null;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean; // Loading state during API call
}

// --- MAIN COMPONENT (Updated) ---
const BookingModal: React.FC<BookingModalProps> = ({ visible, tripDetails, onConfirm, onClose, loading = false }) => {
  if (!tripDetails) {
    return null;
  }

  // Check if this is for a waitlist
  const isWaitlist = tripDetails.isWaitlist;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* DYNAMIC TITLE */}
          <Text style={styles.title}>
            {isWaitlist ? 'Join the Waitlist' : 'Confirm Your Trip'}
          </Text>
          {/* DYNAMIC SUBTITLE */}
          <Text style={styles.subtitle}>
            {isWaitlist
              ? "No seats are currently available, but we can notify you if a spot opens up."
              : 'Please review the details below before confirming your booking.'}
          </Text>

          <View style={styles.detailsCard}>
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

          {/* DYNAMIC BUTTON */}
          <TouchableOpacity
            style={[styles.confirmButton, isWaitlist && styles.waitlistButton, loading && styles.buttonDisabled]}
            onPress={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.confirmButtonText}>
                {isWaitlist ? 'Confirm Waitlist' : 'Confirm Booking'}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// --- STYLES (Updated) ---
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 25,
  },
  detailsCard: {
    backgroundColor: '#f7f8fc',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    marginRight: 15,
  },
  detailText: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
  },
  confirmButton: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#007bff', // Default blue for booking
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  waitlistButton: {
    backgroundColor: '#fd7e14', // Orange for waitlist
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6c757d',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default BookingModal;