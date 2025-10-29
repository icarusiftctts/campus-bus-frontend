import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
// Use React Native Vector Icons instead of react-icons
import Icon from 'react-native-vector-icons/Ionicons';

// Corrected path:
// From: './sidebar'
// To: './Sidebar' (Sibling file)
import Sidebar from './Sidebar';

// This component receives 'onProfileClick' prop to navigate to the profile page
const Header = ({ onProfileClick, onGoToMyTrip, onGoToTripHistory, onGoToFeedback, onLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          {/* Menu Icon Button */}
          <TouchableOpacity style={styles.iconButton} onPress={() => setSidebarOpen(true)}>
            <Icon name="menu" size={24} color="#4a5568" />
          </TouchableOpacity>

          <Text style={styles.logo}>Campus Connect</Text>

          {/* Profile Icon Button */}
          <View style={styles.profileIconContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={onProfileClick}>
              <Icon name="person-circle" size={28} color="#4a5568" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Sidebar is a sibling component */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onGoToMyTrip={onGoToMyTrip}
        onGoToTripHistory={onGoToTripHistory}
        onGoToFeedback={onGoToFeedback}
        onLogout={onLogout}
      />
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'white', // Header background for SafeAreaView
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: 'white', // Actual header background
    // Use shadow/elevation for a floating effect if desired
    // elevation: 2,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
  },
  logo: {
    fontWeight: '700',
    fontSize: 18,
    color: '#1a202c',
    marginLeft: 15,
  },
  iconButton: {
    padding: 5, // Touchable area padding
  },
  profileIconContainer: {
    marginLeft: 'auto', // Pushes the profile icon to the far right
  },
});

export default Header;