import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { launchCamera, ImagePickerResponse, Asset } from 'react-native-image-picker';

// --- TYPE DEFINITIONS ---

// Represents the student being reported. Pass this from the parent screen.
export interface ReportableStudent {
  id: string;
  name: string;
}

// The data object that will be sent on submission.
export interface ReportData {
  studentId: string;
  studentName: string;
  reason: string;
  comments: string;
  photo?: Asset; // The photo asset from image-picker
}

// Props for the modal component
interface ReportingModalProps {
  visible: boolean;
  student: ReportableStudent | null;
  onClose: () => void;
  onSubmit: (data: ReportData) => void;
}

const REPORT_REASONS = [
  'Misbehavior',
  'Attempted boarding without valid QR',
  'Other',
];

// --- COMPONENT ---

const ReportingModal: React.FC<ReportingModalProps> = ({
  visible,
  student,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState<string>('');
  const [comments, setComments] = useState('');
  const [photo, setPhoto] = useState<Asset | null>(null);
  const [isReasonPickerVisible, setReasonPickerVisible] = useState(false);

  // Reset form state whenever the modal is closed or the student changes
  useEffect(() => {
    if (!visible) {
      setReason('');
      setComments('');
      setPhoto(null);
      setReasonPickerVisible(false);
    }
  }, [visible]);

  // Handler to open the device camera
  const handleTakePhoto = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.7,
        saveToPhotos: true, // Optional: save a copy to the gallery
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          Alert.alert('Camera Error', `An error occurred: ${response.errorMessage}`);
        } else if (response.assets && response.assets.length > 0) {
          setPhoto(response.assets[0]);
        }
      }
    );
  };

  // Handler for the final submission
  const handleSubmit = () => {
    if (!student) return; // Should not happen if modal is visible

    // 1. Validation
    if (!reason) {
      Alert.alert('Validation Error', 'Please select a reason for the report.');
      return;
    }
    if (reason === 'Other' && !comments.trim()) {
      Alert.alert('Validation Error', 'Please provide details in the comments for "Other".');
      return;
    }

    // 2. Prepare data payload
    const reportData: ReportData = {
      studentId: student.id,
      studentName: student.name,
      reason: reason,
      comments: comments.trim(),
      ...(photo && { photo }), // Conditionally add the photo asset
    };

    // 3. Call the onSubmit prop and close the modal
    onSubmit(reportData);
    onClose(); // Close modal on successful submission
  };

  // Do not render anything if the student data is not available
  if (!student) {
    return null;
  }

  // Render the selected reason or a placeholder
  const renderReasonText = () => {
    if (reason) {
      return <Text style={styles.dropdownValue}>{reason}</Text>;
    }
    return <Text style={styles.dropdownPlaceholder}>Select a reason...</Text>;
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={() => setReasonPickerVisible(false)}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Report {student.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="times" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Reason for Report Dropdown */}
          <Text style={styles.label}>Reason for Report</Text>
          <View>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setReasonPickerVisible(!isReasonPickerVisible)}
            >
              {renderReasonText()}
              <Icon name={isReasonPickerVisible ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
            </TouchableOpacity>

            {isReasonPickerVisible && (
              <View style={styles.dropdownOptionsContainer}>
                {REPORT_REASONS.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setReason(item);
                      setReasonPickerVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownOptionText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Photo Section */}
          <Text style={styles.label}>Evidence (Optional)</Text>
          {photo ? (
            <View style={styles.thumbnailContainer}>
              <Image source={{ uri: photo.uri }} style={styles.thumbnail} />
              <TouchableOpacity style={styles.removePhotoButton} onPress={() => setPhoto(null)}>
                <Icon name="times-circle" solid size={24} color="#D9534F" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
              <Icon name="camera" size={18} color="#38A169" />
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
          )}

          {/* Comments Section */}
          <Text style={styles.label}>Comments</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter details here..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={comments}
            onChangeText={setComments}
          />

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Report</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a202c',
  },
  closeButton: {
    padding: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  // Dropdown styles
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 16,
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  dropdownValue: {
    color: '#1A202C',
    fontSize: 16,
  },
  dropdownOptionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: -10, // Overlap the dropdown button slightly
    marginBottom: 16,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#1A202C',
  },
  // Photo styles
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF4FF',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#38A169',
    borderRadius: 8,
    height: 50,
    marginBottom: 16,
  },
  photoButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#38A169',
  },
  thumbnailContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  thumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
  },
  // Text Area
  textArea: {
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 15,
    paddingTop: 12,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#1A202C',
    height: 100,
    marginBottom: 24,
  },
  // Submit button
  submitButton: {
    backgroundColor: '#D9534F', // Red for reporting action
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default ReportingModal;