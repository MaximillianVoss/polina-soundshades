import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthApi from 'firebase/auth';
import type { Persistence } from 'firebase/auth';
// Firebase 12 экспортирует функцию в RN entry, но общий .d.ts её не перечисляет.
// Обращение через namespace не подменяет SDK; runtime-проверка выявит неверный entry.
const nativeApi = AuthApi as typeof AuthApi & {
  getReactNativePersistence(storage: typeof AsyncStorage): Persistence;
};
export function authPersistence(): Persistence {
  if (typeof nativeApi.getReactNativePersistence !== 'function') throw new Error('Firebase RN persistence недоступен: проверьте версии Firebase/Expo.');
  return nativeApi.getReactNativePersistence(AsyncStorage);
}
