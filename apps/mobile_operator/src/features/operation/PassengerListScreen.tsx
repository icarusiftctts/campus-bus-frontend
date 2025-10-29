import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import ReportingModal, { ReportableStudent, ReportData } from './ReportingModal';
import { operatorService } from '../../services';

interface Passenger {
  studentId: string;
  studentName: string;
  status: 'SCANNED' | 'CONFIRMED' | 'WAITLIST';
}

// --- COMPONENT ---
const PassengerListScreen = ({ navigation, route }) => {
  const { tripId } = route.params; // Get tripId passed from ScannerScreen

  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [studentToReport, setStudentToReport] = useState<ReportableStudent | null>(null);

  useEffect(() => {
    loadPassengers();
  }, [tripId]);

  const loadPassengers = async () => {
    setIsLoading(true);
    try {
      const data = await operatorService.getPassengerList(tripId);
      setPassengers(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load passengers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenReportModal = (passenger: Passenger) => {
    setStudentToReport({ id: passenger.studentId, name: passenger.studentName });
    setReportModalVisible(true);
  };

  const handleReportSubmit = async (data: ReportData) => {
    try {
      await operatorService.submitReport({
        tripId,
        studentId: data.studentId,
        incidentType: data.incidentType,
        description: data.description,
        photoBase64: data.photoBase64,
      });
      Alert.alert('Report Submitted', `Your report for ${data.studentName} has been sent successfully.`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit report');
    }
  };

  const renderPassengerItem = ({ item }: { item: Passenger }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleOpenReportModal(item)}>
      <Icon
        name={item.status === 'SCANNED' ? 'check-circle' : 'times-circle'}
        solid
        color={item.status === 'SCANNED' ? '#38A169' : '#A0AEC0'}
        size={24}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.studentName}</Text>
        <Text style={styles.itemId}>ID: {item.studentId}</Text>
      </View>
      <Icon name="chevron-right" size={16} color="#CBD5E0" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#1a202c" />
        </TouchableOpacity>
        <Text style={styles.title}>Passenger List</Text>
        <View style={{ width: 40 }} /> {/* Spacer to keep title centered */}
      </View>
      <Text style={styles.subHeader}>Trip ID: {tripId}</Text>

      {/* List Content */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#38A169" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={passengers}
          renderItem={renderPassengerItem}
          keyExtractor={(item) => item.studentId}
          contentContainerStyle={styles.listContent}
        />
      )}

      <ReportingModal
        visible={isReportModalVisible}
        student={studentToReport}
        onClose={() => setReportModalVisible(false)}
        onSubmit={handleReportSubmit}
      />
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: { padding: 4 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a202c' },
  subHeader: {
    fontSize: 14,
    color: '#718096',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  listContent: { paddingHorizontal: 16, paddingTop: 10 },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  itemDetails: { flex: 1, marginLeft: 16 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#2D3748' },
  itemId: { fontSize: 12, color: '#718096', marginTop: 2 },
});

export default PassengerListScreen;