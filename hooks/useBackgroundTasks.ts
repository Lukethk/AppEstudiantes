import { useEffect } from 'react';
import { LocalNotificationService } from '../services/LocalNotificationService';

export const useBackgroundTasks = () => {
  useEffect(() => {
    const setupBackgroundTasks = async () => {
      try {
        const notificationService = LocalNotificationService.getInstance();
        
        const initialized = await notificationService.initialize();
        
        if (initialized) {
          await notificationService.startPeriodicCheck();
          console.log('✅ Tareas en segundo plano configuradas correctamente');
        } else {
          console.log('⚠️ Permisos de notificaciones no otorgados');
        }
      } catch (error) {
        console.error('❌ Error al configurar tareas en segundo plano:', error);
      }
    };

    setupBackgroundTasks();

    return () => {
      const notificationService = LocalNotificationService.getInstance();
      notificationService.stopPeriodicCheck();
    };
  }, []);
}; 