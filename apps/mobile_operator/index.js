/**
 * @format
 */

import {AppRegistry} from 'react-native';
// ----------------------------------------------------
// FIX: Import AppNavigator.tsx instead of the missing App file.
import App from './AppNavigator';
// ----------------------------------------------------
import {name as appName} from './app.json';

// The AppRegistry registers the component using the name 'App',
// which is the alias we created above for AppNavigator.
AppRegistry.registerComponent(appName, () => App);
