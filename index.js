/**
 * @format
 */

import { AppRegistry } from 'react-native';
import { App } from './src';
import GryoscopeImage from './src/GryoscopeImage';
import NativePadometer from './src/NativePadometer';
import NativeNotificatio from './src/NativeNotificatio';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => NativeNotificatio);
