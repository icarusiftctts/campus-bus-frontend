import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, PermissionsAndroid, Platform, Alert, ActivityIndicator } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { qrService, operatorService } from '../../services';

const ScannerScreen: React.FC<any> = ({ navigation, route }) => {
  const { tripId } = route.params;

  const [isScanning, setIsScanning] = useState(true);
  const [scanStatus, setScanStatus] = useState<'valid' | 'invalid' | 'duplicate' | null>(null);
  const [scannedName, setScannedName] = useState('');
  const [boardedCount, setBoardedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    requestCameraPermission();
    loadPassengerCounts();
    startGPSTracking();
    return () => stopGPSTracking();
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission Required',
            message: 'This app needs access to your camera to scan student QR codes.',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          },
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn(err);
        setHasPermission(false);
      }
    } else {
      setHasPermission(true);
    }
  };

  const loadPassengerCounts = async () => {
    try {
      const passengers = await operatorService.getPassengerList(tripId);
      setTotalCount(passengers.length);
      setBoardedCount(passengers.filter(p => p.status === 'SCANNED').length);
    } catch (error) {
      console.error('Failed to load passenger counts:', error);
    }
  };

  let gpsInterval: any = null;
  const startGPSTracking = () => {
    gpsInterval = setInterval(async () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await operatorService.updateGPS(
              tripId,
              position.coords.latitude,
              position.coords.longitude
            );
          } catch (error) {
            console.error('GPS update failed:', error);
          }
        },
        (error) => console.error('GPS error:', error),
        { enableHighAccuracy: true }
      );
    }, 30000);
  };

  const stopGPSTracking = () => {
    if (gpsInterval) clearInterval(gpsInterval);
  };

  const onScanSuccess = async (e: { data: string }) => {
    if (!isScanning || loading) return;
    
    setIsScanning(false);
    setLoading(true);

    try {
      const response = await qrService.validateQR(e.data, tripId);
      
      setScannedName(response.studentName || 'Student');
      
      if (response.status === 'VALID') {
        setScanStatus('valid');
        setBoardedCount(prev => prev + 1);
      } else if (response.status === 'DUPLICATE') {
        setScanStatus('duplicate');
      } else {
        setScanStatus('invalid');
      }

      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(1700),
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        setScanStatus(null);
        setIsScanning(true);
        setLoading(false);
      });
    } catch (error: any) {
      Alert.alert('Scan Error', error.message || 'Invalid QR code');
      setIsScanning(true);
      setLoading(false);
    }
  };

  const getOverlayStyle = () => {
    if (scanStatus === 'valid') return { borderColor: '#38A169', text: 'VALID' };
    if (scanStatus === 'invalid') return { borderColor: '#E53E3E', text: 'INVALID QR' };
    if (scanStatus === 'duplicate') return { borderColor: '#ECC94B', text: 'ALREADY SCANNED' };
    return { borderColor: 'transparent', text: '' };
  };

  const { borderColor, text } = getOverlayStyle();

  if (hasPermission === null) {
    return <View style={styles.container}><Text style={styles.permissionText}>Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera permission denied. Enable it in device settings.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <QRCodeScanner
        onRead={onScanSuccess}
        cameraStyle={styles.cameraContainer}
        reactivate={isScanning}
        reactivateTimeout={2500}
      />

      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Trip ID: {tripId}</Text>
          <TouchableOpacity style={styles.endShiftButton} onPress={() => navigation.popToTop()}>
            <Icon name="times-circle" size={24} color="#D9534F" />
            <Text style={styles.endShiftButtonText}>End Shift</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.markerContainer}>
          <View style={styles.marker} />
          {loading && <ActivityIndicator size="large" color="white" style={styles.loadingIndicator} />}
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.passengerListButton}
            onPress={() => navigation.navigate('PassengerList', { tripId })}
          >
            <Icon name="users" size={20} color="white" />
            <Text style={styles.passengerListButtonText}>View Passenger List</Text>
          </TouchableOpacity>
          <View style={styles.counter}>
            <Text style={styles.counterText}>Boarded: {boardedCount}/{totalCount}</Text>
          </View>
        </View>
      </View>

      {scanStatus && (
        <Animated.View style={[styles.feedbackOverlay, { borderColor, opacity: fadeAnim }]}>
          <Text style={styles.feedbackText}>{text}</Text>
          <Text style={styles.feedbackName}>{scannedName}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  cameraContainer: { height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  header: {
    padding: 20, paddingTop: 50, backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  endShiftButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
  },
  endShiftButtonText: { color: 'white', marginLeft: 8, fontWeight: '600' },
  markerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  marker: {
    width: 250, height: 250, borderRadius: 12, borderWidth: 3, borderColor: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingIndicator: { position: 'absolute' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 90, backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)',
  },
  passengerListButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#3182CE',
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8,
  },
  passengerListButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  counter: {},
  counterText: { color: 'white', fontSize: 16, fontWeight: '600' },
  feedbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 8,
  },
  feedbackText: { color: 'white', fontSize: 32, fontWeight: 'bold', letterSpacing: 2 },
  feedbackName: { color: 'white', fontSize: 20, marginTop: 8 },
  permissionText: { color: 'white', fontSize: 18, textAlign: 'center', padding: 20 },
});

export default ScannerScreen;