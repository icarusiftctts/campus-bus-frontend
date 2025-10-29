import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import profileService, { BookingHistory } from '../../services/profile.service';

interface TripHistoryScreenProps {
  onGoBack: () => void;
}

const TripHistoryItem = ({ route, date, time, status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCANNED':
      case 'CONFIRMED':
        return '#28a745';
      case 'CANCELLED':
        return '#dc3545';
      case 'WAITLIST':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCANNED':
        return 'Completed';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'WAITLIST':
        return 'Waitlisted';
      default:
        return status;
    }
  };

  const statusColor = getStatusColor(status);
  const statusText = getStatusText(status);
  const isCancelled = status === 'CANCELLED';

  return (
    <View style={styles.tripCard}>
      <View>
        <Text style={styles.tripRoute}>{route}</Text>
        <Text style={styles.tripDateTime}>{date} at {time}</Text>
      </View>
      <View style={[styles.statusBadge, isCancelled && styles.statusBadgeCancelled]}>
        <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
      </View>
    </View>
  );
};

const TripHistoryScreen: React.FC<TripHistoryScreenProps> = ({ onGoBack }) => {
  const [bookings, setBookings] = useState<BookingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookingHistory();
  }, []);

  const loadBookingHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileService.getBookingHistory();
      const sorted = data.sort((a, b) => 
        new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
      );
      setBookings(sorted);
    } catch (err: any) {
      setError(err.message || 'Failed to load booking history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Icon name="chevron-left" size={20} color="#4a5568" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Trip History</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBookingHistory}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="calendar-times-o" size={60} color="#cbd5e0" />
          <Text style={styles.emptyText}>No trip history yet</Text>
          <Text style={styles.emptySubtext}>Your past bookings will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={({ item }) => (
            <TripHistoryItem
              route={profileService.formatRoute(item.route)}
              date={profileService.formatDate(item.tripDate)}
              time={profileService.formatTime(item.departureTime)}
              status={item.status}
            />
          )}
          keyExtractor={item => item.bookingId}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f7f8fc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a202c',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a5568',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#a0aec0',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
  },
  tripCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  tripRoute: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: 4,
  },
  tripDateTime: {
    fontSize: 14,
    color: '#6c757d',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
  },
  statusBadgeCancelled: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
  },
  statusText: {
    fontWeight: '600',
    fontSize: 12,
  },
});

export default TripHistoryScreen;