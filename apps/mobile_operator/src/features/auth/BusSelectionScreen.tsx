import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { operatorService } from '../../services';

interface Trip {
  tripId: string;
  departureTime: string;
  busNumber: string;
  route: string;
  status: 'ACTIVE' | 'SCHEDULED' | 'COMPLETED';
}

interface BusSelectionScreenProps {
  onStartScanning: (tripId: string) => void;
  onLogout: () => void;
}

const BusSelectionScreen: React.FC<BusSelectionScreenProps> = ({
  onStartScanning,
  onLogout,
}) => {
  const [availableTrips, setAvailableTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const trips = await operatorService.getOperatorTrips(today);
      setAvailableTrips(trips.filter(t => t.status !== 'COMPLETED'));
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load trips');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartShift = () => {
    if (selectedTrip) {
      setShowConfirmModal(true);
    } else {
      Alert.alert('Selection Required', 'Please select a trip before starting');
    }
  };

  const confirmStartShift = async () => {
    if (!selectedTrip) return;
    
    try {
      await operatorService.startTrip(selectedTrip.tripId);
      setShowConfirmModal(false);
      onStartScanning(selectedTrip.tripId);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start trip');
    }
  };

  const formatTime = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const renderTripItem = ({ item }: { item: Trip }) => {
    const isActive = item.status === 'ACTIVE';
    const isSelected = selectedTrip?.tripId === item.tripId;

    return (
      <TouchableOpacity
        style={[
          styles.tripItem,
          isSelected && styles.selectedTripItem,
          isActive && styles.activeTripItem,
        ]}
        onPress={() => setSelectedTrip(item)}
      >
        <Icon
          name="bus"
          size={24}
          color={isSelected ? '#FFFFFF' : isActive ? '#ECC94B' : '#38A169'}
          style={styles.tripIcon}
        />
        <View style={styles.tripDetails}>
          <Text style={[styles.tripTime, isSelected && { color: '#FFFFFF' }]}>
            {formatTime(item.departureTime)}
          </Text>
          <Text style={[styles.tripRoute, isSelected && { color: '#EBF4FF' }]}>
            {item.busNumber} | {item.route}
          </Text>
        </View>
        {isActive && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>IN PROGRESS</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Trip</Text>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Icon name="sign-out-alt" size={20} color="#D9534F" />
        </TouchableOpacity>
      </View>

      <Text style={styles.instructionText}>
        Select a current or upcoming trip to start scanning.
      </Text>

      <View style={styles.listContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#38A169" />
        ) : availableTrips.length === 0 ? (
          <Text style={styles.emptyText}>No upcoming trips found.</Text>
        ) : (
          <FlatList
            data={availableTrips}
            renderItem={renderTripItem}
            keyExtractor={(item) => item.tripId}
            extraData={selectedTrip}
          />
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.startButton,
          !selectedTrip && styles.startButtonDisabled,
        ]}
        onPress={handleStartShift}
        disabled={!selectedTrip}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>
          {selectedTrip ? `Start Scanning: ${selectedTrip.busNumber}` : 'Select a Trip'}
        </Text>
      </TouchableOpacity>

      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Shift Start</Text>
            <Text style={styles.modalText}>
              Starting trip {selectedTrip?.tripId} on {selectedTrip?.route}.
            </Text>
            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowConfirmModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.confirmButton]} onPress={confirmStartShift}>
                <Text style={styles.confirmButtonText}>Start Scanning</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ebf4ff', paddingHorizontal: 20, paddingTop: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#1a202c' },
  logoutButton: { padding: 5 },
  instructionText: { fontSize: 16, color: '#4A5568', marginBottom: 20 },
  listContainer: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  tripItem: {
    flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 10,
    backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0',
  },
  selectedTripItem: { backgroundColor: '#38A169', borderColor: '#1A4D2E' },
  activeTripItem: { backgroundColor: '#FFECB3', borderColor: '#ECC94B' },
  tripIcon: { marginRight: 15 },
  tripDetails: { flex: 1 },
  tripTime: { fontSize: 18, fontWeight: '700', color: '#1a202c' },
  tripRoute: { fontSize: 14, marginTop: 2, color: '#4A5568' },
  statusBadge: { backgroundColor: '#ECC94B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  statusBadgeText: { color: '#38A169', fontSize: 12, fontWeight: 'bold' },
  startButton: {
    marginTop: 20, marginBottom: 10, paddingVertical: 15, backgroundColor: '#38A169',
    borderRadius: 10, alignItems: 'center',
  },
  startButtonDisabled: { backgroundColor: '#A0AEC0' },
  startButtonText: { color: 'white', fontSize: 18, fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#718096' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 12, padding: 24, width: '85%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1a202c', marginBottom: 12 },
  modalText: { fontSize: 16, color: '#4A5568', marginBottom: 24 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, minWidth: 100, alignItems: 'center' },
  cancelButton: { backgroundColor: '#E2E8F0' },
  confirmButton: { backgroundColor: '#38A169' },
  cancelButtonText: { color: '#4A5568', fontWeight: '600', fontSize: 16 },
  confirmButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
});

export default BusSelectionScreen;

