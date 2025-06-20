import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { NOTIFICATION_CONFIG, isPushNotificationsEnabled } from '../config/notifications.config';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: NOTIFICATION_CONFIG.LOCAL_NOTIFICATIONS.sound !== null,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  registerForPushNotificationsAsync: () => Promise<string | null>;
  sendLocalNotification: (title: string, body: string, data?: any) => Promise<void>;
  clearNotification: () => void;
  isPushEnabled: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  useEffect(() => {
    // Verificar si las notificaciones push están habilitadas
    setIsPushEnabled(isPushNotificationsEnabled());
    
    // Cargar token guardado al iniciar
    loadSavedToken();
    
    // Configurar listeners de notificaciones
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificación respondida:', response);
      // Aquí puedes manejar la navegación cuando el usuario toca la notificación
      handleNotificationResponse(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const loadSavedToken = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('expoPushToken');
      if (savedToken) {
        setExpoPushToken(savedToken);
      }
    } catch (error) {
      console.error('Error al cargar el token guardado:', error);
    }
  };

  const registerForPushNotificationsAsync = async (): Promise<string | null> => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permisos de notificación no otorgados');
        return null;
      }

      // Verificar si las notificaciones push están habilitadas
      if (!isPushNotificationsEnabled()) {
        console.log('Notificaciones push no configuradas. Solo se usarán notificaciones locales.');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: NOTIFICATION_CONFIG.PROJECT_ID!,
      });

      if (token.data) {
        setExpoPushToken(token.data);
        await AsyncStorage.setItem('expoPushToken', token.data);
        
        // Enviar token al servidor para guardarlo
        await sendTokenToServer(token.data);
        
        return token.data;
      }

      return null;
    } catch (error) {
      console.error('Error al registrar notificaciones:', error);
      return null;
    }
  };

  const sendTokenToServer = async (token: string) => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : null;

      if (user && user.id_estudiante) {
        await fetch(`${NOTIFICATION_CONFIG.API_URL}/estudiantes/push-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_estudiante: user.id_estudiante,
            push_token: token,
          }),
        });
      }
    } catch (error) {
      console.error('Error al enviar token al servidor:', error);
    }
  };

  const sendLocalNotification = async (title: string, body: string, data?: any) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: NOTIFICATION_CONFIG.LOCAL_NOTIFICATIONS.sound,
        },
        trigger: null, // Enviar inmediatamente
      });
    } catch (error) {
      console.error('Error al enviar notificación local:', error);
    }
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    // Manejar navegación basada en el tipo de notificación
    if (data.solicitudId) {
      // Navegar a la solicitud específica
      // Aquí necesitarías importar router de expo-router
      // router.push(`/solicitud/${data.solicitudId}`);
    }
  };

  const value: NotificationContextType = {
    expoPushToken,
    notification,
    registerForPushNotificationsAsync,
    sendLocalNotification,
    clearNotification,
    isPushEnabled,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 