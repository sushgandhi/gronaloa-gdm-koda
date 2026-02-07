
import { registerRootComponent } from 'expo';
import { AppRegistry, Platform } from 'react-native';
import App from './App';

// For web/preview environments, we need to explicitly run the application
if (Platform.OS === 'web') {
    AppRegistry.registerComponent('KodaApp', () => App);
    AppRegistry.runApplication('KodaApp', {
        initialProps: {},
        rootTag: document.getElementById('root'),
    });
} else {
    // For native Expo environments
    registerRootComponent(App);
}
