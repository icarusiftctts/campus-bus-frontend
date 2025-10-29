// features/student/MyTripScreen.tsx

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CancellationConfirmationModal from './CancellationConfirmationModal';

// This is now a placeholder for when there is no active trip
const noActiveTrip = {
  route: 'N/A',
  date: 'N/A',
  time: 'N/A',
  busNumber: 'N/A',
};

interface TripDetails {
  time: string;
  date: string;
  route: string;
  busNumber?: string; // busNumber is optional
}

interface MyTripScreenProps {
  bookedTrip: TripDetails | null; // Receive the booked trip as a prop
  onGoBack: () => void;
  onCancelTrip: () => void;
}

const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const MyTripScreen: React.FC<MyTripScreenProps> = ({ bookedTrip, onGoBack, onCancelTrip }) => {
  const [isCancelModalVisible, setCancelModalVisible] = useState(false);

  // Determine if there's an active trip. If not, use the placeholder.
  const hasActiveTrip = bookedTrip !== null;
  const activeTrip = bookedTrip || noActiveTrip;

  const qrCodeUrl = useMemo(() => {
    const qrData = hasActiveTrip
      ? `
        Route: ${activeTrip.route}
        Date: ${activeTrip.date}
        Time: ${activeTrip.time}
        Bus: ${activeTrip.busNumber || 'TBD'}
        BookingID: ${Math.random().toString(36).substr(2, 9)}
      `
      : 'No active trip booked. Please book a trip on the dashboard.';

    const encodedData = encodeURIComponent(qrData.trim());
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedData}`;
  }, [bookedTrip]); // Re-generate QR code if the bookedTrip prop changes

  const handleConfirmCancellation = () => {
    setCancelModalVisible(false);
    onCancelTrip();
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Icon name="chevron-back" size={24} color="#4a5568" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Active Trip</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.qrCard}>
          <Text style={styles.qrHeader}>Scan for Boarding</Text>
          <Image source={{ uri: qrCodeUrl }} style={styles.qrCode} />
        </View>

        {/* Conditionally render trip details or a message */}
        {hasActiveTrip ? (
          <View style={styles.detailsCard}>
              <Text style={styles.detailsHeader}>TRIP DETAILS</Text>
              <InfoRow label="Route" value={activeTrip.route} />
              <InfoRow label="Date" value={activeTrip.date} />
              <InfoRow label="Time" value={activeTrip.time} />
              <InfoRow label="Bus Number" value={activeTrip.busNumber || 'Not Assigned'} />
          </View>
        ) : (
          <View style={styles.noTripCard}>
            <Icon name="information-circle-outline" size={32} color="#4a5568" />
            <Text style={styles.noTripText}>You have no active trip.</Text>
            <Text style={styles.noTripSubtext}>Please book a trip from the dashboard.</Text>
          </View>
        )}

        {/* Only show the Cancel button if there is an active trip */}
        {hasActiveTrip && (
          <TouchableOpacity style={styles.cancelButton} onPress={() => setCancelModalVisible(true)}>
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <CancellationConfirmationModal
        visible={isCancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
        onConfirm={handleConfirmCancellation}
      />
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
  content: { padding: 20, alignItems: 'center' },
  qrCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    marginBottom: 25,
    elevation: 3,
  },
  qrHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 20,
  },
  qrCode: {
    width: 250,
    height: 250,
    backgroundColor: '#e9ecef'
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 3,
    marginBottom: 25,
  },
  detailsHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0AEC0',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: { fontSize: 16, color: '#6c757d' },
  infoValue: { fontSize: 16, fontWeight: '600', color: '#1a202c' },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    backgroundColor: '#dc3545',
    borderRadius: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // New styles for the "No Active Trip" message
  noTripCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 3,
  },
  noTripText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a202c',
    marginTop: 15,
  },
  noTripSubtext: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
});

export default MyTripScreen;