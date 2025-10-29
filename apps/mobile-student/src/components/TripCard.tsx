import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

// Define the shape of the props using a TypeScript interface
interface TripCardProps {
  time: string;
  availableSeats: number;
  totalSeats: number;
  status: 'Booking Open' | 'Bus Full' | 'Booking Opens Soon';
}

const TripCard: React.FC<TripCardProps> = ({ time, availableSeats, totalSeats, status }) => {
  const isBookingOpen = status === 'Booking Open';

  const handleBookPress = () => {
    if (isBookingOpen) {
      Alert.alert('Booking Confirmed', `Your seat for the ${time} bus has been booked.`);
    } else {
      Alert.alert('Booking Unavailable', 'This bus is not available for booking right now.');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.details}>
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.seats}>
          {`${availableSeats} / ${totalSeats} seats available`}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.bookButton, !isBookingOpen && styles.disabledButton]}
        onPress={handleBookPress}
        disabled={!isBookingOpen}
      >
        <Text style={styles.bookButtonText}>Book Seat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    // Shadow for Android
    elevation: 5,
  },
  details: {
    alignItems: 'flex-start',
  },
  time: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 5,
  },
  seats: {
    fontSize: 14,
    color: '#718096',
  },
  bookButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

export default TripCard;