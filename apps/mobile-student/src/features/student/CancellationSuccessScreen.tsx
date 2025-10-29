// features/student/CancellationSuccessScreen.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface CancellationSuccessScreenProps {
    onGoToDashboard: () => void;
}

const CancellationSuccessScreen: React.FC<CancellationSuccessScreenProps> = ({ onGoToDashboard }) => {
  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onGoToDashboard}>
                <Icon name="chevron-back" size={24} color="#4a5568" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cancellation</Text>
        </View>
        <View style={styles.content}>
            <Icon name="checkmark-circle" size={120} color="#28a745" />
            <Text style={styles.title}>Booking Cancelled</Text>
            <Text style={styles.subtitle}>Your booking has been successfully cancelled.</Text>
            <TouchableOpacity style={styles.doneButton} onPress={onGoToDashboard}>
                <Text style={styles.doneButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
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
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1a202c',
        marginTop: 20,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#718096',
        textAlign: 'center',
        marginBottom: 40,
    },
    doneButton: {
        paddingVertical: 15,
        paddingHorizontal: 80,
        backgroundColor: '#007bff',
        borderRadius: 10,
    },
    doneButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});

export default CancellationSuccessScreen;