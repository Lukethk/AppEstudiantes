import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { LocalNotificationService } from '../services/LocalNotificationService';

export const useAppState = () => {
  const appState = useRef(AppState.currentState);
  const notificationService = LocalNotificationService.getInstance();

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log('📱 Estado de la app cambió:', appState.current, '->', nextAppState);

      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 App vuelve al primer plano');
        
        if (!notificationService.isActive()) {
          notificationService.startPeriodicCheck();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        console.log('📱 App va al segundo plano - Manteniendo verificación activa');
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  return {
    currentState: appState.current,
    isActive: () => appState.current === 'active',
    isBackground: () => appState.current === 'background',
  };
}; 