// features/student/CancellationConfirmationModal.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface CancellationConfirmationModalProps {
  visible: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const CancellationConfirmationModal: React.FC<CancellationConfirmationModalProps> = ({ visible, onConfirm, onClose }) => {
  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Icon name="alert-circle-outline" size={60} color="#dc3545" style={styles.icon} />
          <Text style={styles.title}>Are you sure?</Text>
          <Text style={styles.subtitle}>
            Do you really want to cancel this booking? This action cannot be undone.
          </Text>

          <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
            <Text style={styles.confirmButtonText}>Yes, Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>No</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

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
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 30,
  },
  confirmButton: {
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#dc3545',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
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
});

export default CancellationConfirmationModal;