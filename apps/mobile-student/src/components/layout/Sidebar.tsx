import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  Animated,
  Pressable,
} from 'react-native';

// Import icons from react-native-vector-icons
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

// --- PROPS INTERFACES ---
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToMyTrip: () => void;
  onGoToTripHistory: () => void;
  onGoToFeedback: () => void;
  onLogout: () => void; // <--- ADDED PROP HERE
}

interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  onPress?: () => void;
}

// --- HELPER COMPONENT: MenuItem ---
const MenuItem: React.FC<MenuItemProps> = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIcon}>{icon}</View>
    <Text style={styles.menuItemText}>{text}</Text>
  </TouchableOpacity>
);

// --- MAIN COMPONENT: Sidebar ---
const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    onGoToMyTrip,
    onGoToTripHistory,
    onGoToFeedback,
    onLogout // <--- DESTRUCTURED PROP HERE
}) => {
  const slideAnim = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, slideAnim]);

  // These functions will navigate and then close the sidebar
  const navigateToMyTrip = () => {
    onGoToMyTrip();
    onClose();
  };

  const navigateToTripHistory = () => {
    onGoToTripHistory();
    onClose();
  };

  const navigateToFeedback = () => {
    onGoToFeedback();
    onClose();
  };

  // Function to handle logout and close sidebar
  const handleLogout = () => { // <--- NEW HANDLER
      onLogout();
      onClose();
  }

  return (
    <Modal
      transparent
      visible={isOpen}
      onRequestClose={onClose}
      animationType="fade"
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
          onStartShouldSetResponder={() => true}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Menu</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.menuList}>
              {/* The two main options you requested */}
              <MenuItem icon={<Icon name="bus-outline" size={24} color="#4A5568" />} text="My Active Trip" onPress={navigateToMyTrip} />
              <MenuItem icon={<Icon name="chatbubble-ellipses-outline" size={24} color="#4A5568" />} text="Submit Feedback" onPress={navigateToFeedback} />

              <MenuItem icon={<FontAwesome name="history" size={22} color="#4A5568" />} text="My Trip History" onPress={navigateToTripHistory} />
              <MenuItem icon={<Icon name="help-circle-outline" size={24} color="#4A5568" />} text="Help & Support" />
            </View>
            <View style={styles.footer}>
              {/* ATTACHED THE NEW LOGOUT HANDLER HERE */}
              <MenuItem icon={<Icon name="log-out-outline" size={24} color="#D9534F" />} text="Logout" onPress={handleLogout} />
            </View>
          </SafeAreaView>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 300,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A202C'
  },
  menuList: {
    padding: 20,
    flexGrow: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuIcon: {
    marginRight: 20,
    width: 24,
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#2d3748',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
});

export default Sidebar;