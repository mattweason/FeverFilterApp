import { AppRegistry, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging'
import App, { store } from './App';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent('feverfilter', () => App);

if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root') || document.getElementById('main');
  AppRegistry.runApplication('feverfilter', { rootTag });
}
