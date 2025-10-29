import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';

// Import the App component we created from the src folder
import AppNavigator from './src/App';

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'dark-content'} />
      {/* Render our app's navigation and logic */}
      <AppNavigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
