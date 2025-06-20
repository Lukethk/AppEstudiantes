import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class LocalNotificationService {
  private static instance: LocalNotificationService;
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  private constructor() {}

  static getInstance(): LocalNotificationService {
    if (!LocalNotificationService.instance) {
      LocalNotificationService.instance = new LocalNotificationService();
    }
    return LocalNotificationService.instance;
  }

  // Inicializar el servicio
  async initialize() {
    try {
      // Solicitar permisos
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('❌ Permisos de notificaciones no otorgados');
        return false;
      }

      // Configurar canal para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      console.log('✅ Servicio de notificaciones locales inicializado');
      return true;
    } catch (error) {
      console.error('❌ Error al inicializar servicio de notificaciones:', error);
      return false;
    }
  }

  // Iniciar verificación periódica
  async startPeriodicCheck() {
    if (this.isRunning) {
      console.log('⚠️ Verificación periódica ya está ejecutándose');
      return;
    }

    this.isRunning = true;
    console.log('🔄 Iniciando verificación periódica cada 10 segundos');

    // Verificación inmediata
    await this.checkForChanges();

    // Configurar intervalo
    this.checkInterval = setInterval(async () => {
      await this.checkForChanges();
    }, 10000); // 10 segundos
  }

  // Detener verificación periódica
  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 Verificación periódica detenida');
  }

  // Verificar cambios en las solicitudes
  private async checkForChanges() {
    try {
      // Obtener datos del usuario
      const userData = await AsyncStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : null;

      if (!user || !user.id_estudiante) {
        return;
      }

      // Obtener estado anterior
      const lastStateData = await AsyncStorage.getItem('lastSolicitudesState');
      const lastState = lastStateData ? JSON.parse(lastStateData) : [];

      // Obtener estado actual
      const response = await fetch(`https://universidad-la9h.onrender.com/estudiantes/solicitudes?id_estudiante=${user.id_estudiante}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        return;
      }

      const currentSolicitudes = await response.json();

      // Comparar estados
      const changes = this.compareSolicitudes(currentSolicitudes, lastState);

      if (changes.length > 0) {
        console.log('🔄 Cambios detectados:', changes);
        
        // Enviar notificaciones
        for (const change of changes) {
          await this.sendNotification(change);
        }

        // Actualizar contador
        await this.updateNotificationCount(changes.length);
      }

      // Guardar estado actual
      await AsyncStorage.setItem('lastSolicitudesState', JSON.stringify(currentSolicitudes));

    } catch (error) {
      console.error('❌ Error en verificación periódica:', error);
    }
  }

  // Comparar solicitudes
  private compareSolicitudes(newSolicitudes: any[], oldSolicitudes: any[]) {
    const changes: Array<{
      solicitud: any;
      oldEstado: string;
      newEstado: string;
    }> = [];

    newSolicitudes.forEach(newSolicitud => {
      const oldSolicitud = oldSolicitudes.find(s => s.id_solicitud === newSolicitud.id_solicitud);
      
      if (oldSolicitud && oldSolicitud.estado !== newSolicitud.estado) {
        changes.push({
          solicitud: newSolicitud,
          oldEstado: oldSolicitud.estado,
          newEstado: newSolicitud.estado,
        });
      }
    });

    return changes;
  }

  // Enviar notificación
  private async sendNotification(change: any) {
    const { solicitud, newEstado } = change;
    
    let title = '';
    let body = '';
    let data = {};

    if (newEstado.toLowerCase() === 'aprobada') {
      title = '✅ Solicitud Aprobada';
      body = `Tu solicitud de "${solicitud.materia_nombre}" ha sido aprobada`;
      data = {
        type: 'solicitud_aprobada',
        solicitudId: solicitud.id_solicitud,
        materia: solicitud.materia_nombre,
      };
    } else if (newEstado.toLowerCase() === 'rechazada') {
      title = '❌ Solicitud Rechazada';
      body = `Tu solicitud de "${solicitud.materia_nombre}" ha sido rechazada`;
      data = {
        type: 'solicitud_rechazada',
        solicitudId: solicitud.id_solicitud,
        materia: solicitud.materia_nombre,
      };
    }

    if (title && body) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Envío inmediato
      });

      // Guardar en historial
      await this.saveToHistory({
        id: Date.now().toString(),
        title,
        body,
        data,
        timestamp: new Date().toISOString(),
        read: false,
      });
    }
  }

  // Guardar notificación en historial
  private async saveToHistory(notification: any) {
    try {
      const existingNotifications = await AsyncStorage.getItem('notifications');
      const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
      
      notifications.unshift(notification);
      
      // Mantener solo las últimas 100 notificaciones
      if (notifications.length > 100) {
        notifications.splice(100);
      }
      
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error al guardar notificación:', error);
    }
  }

  // Actualizar contador de notificaciones
  private async updateNotificationCount(newCount: number) {
    try {
      const currentCount = await AsyncStorage.getItem('notificationCount');
      const count = currentCount ? parseInt(currentCount) : 0;
      await AsyncStorage.setItem('notificationCount', JSON.stringify(count + newCount));
    } catch (error) {
      console.error('Error al actualizar contador:', error);
    }
  }

  // Verificar si está ejecutándose
  isActive(): boolean {
    return this.isRunning;
  }
} 