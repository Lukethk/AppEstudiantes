import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

const BACKGROUND_FETCH_TASK = 'background-fetch-solicitudes';

// Definir la tarea en segundo plano
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    console.log('🔄 Ejecutando tarea en segundo plano...');
    
    // Obtener datos del usuario
    const userData = await AsyncStorage.getItem('userData');
    const user = userData ? JSON.parse(userData) : null;

    if (!user || !user.id_estudiante) {
      console.log('❌ No hay usuario autenticado');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Obtener estado anterior de solicitudes
    const lastStateData = await AsyncStorage.getItem('lastSolicitudesState');
    const lastState = lastStateData ? JSON.parse(lastStateData) : [];

    // Hacer fetch de solicitudes actuales
    const response = await fetch(`https://universidad-la9h.onrender.com/estudiantes/solicitudes?id_estudiante=${user.id_estudiante}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.log('❌ Error al obtener solicitudes en segundo plano');
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }

    const currentSolicitudes = await response.json();

    // Comparar estados para detectar cambios
    const changes = compareSolicitudes(currentSolicitudes, lastState);

    if (changes.length > 0) {
      console.log('🔄 Cambios detectados en segundo plano:', changes);
      
      // Enviar notificaciones para cada cambio
      for (const change of changes) {
        await sendNotificationForChange(change);
      }

      // Actualizar estado guardado
      await AsyncStorage.setItem('lastSolicitudesState', JSON.stringify(currentSolicitudes));
      
      // Actualizar contador de notificaciones
      await updateNotificationCount(changes.length);
      
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }

    // Actualizar estado guardado incluso si no hay cambios
    await AsyncStorage.setItem('lastSolicitudesState', JSON.stringify(currentSolicitudes));
    
    console.log('✅ Tarea en segundo plano completada sin cambios');
    return BackgroundFetch.BackgroundFetchResult.NoData;

  } catch (error) {
    console.error('❌ Error en tarea en segundo plano:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Función para comparar solicitudes
function compareSolicitudes(newSolicitudes: any[], oldSolicitudes: any[]) {
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

// Función para enviar notificación
async function sendNotificationForChange(change: any) {
  const { solicitud, oldEstado, newEstado } = change;
  
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

    // Guardar notificación en el historial
    await saveNotificationToHistory({
      id: Date.now().toString(),
      title,
      body,
      data,
      timestamp: new Date().toISOString(),
      read: false,
    });
  }
}

// Función para guardar notificación en historial
async function saveNotificationToHistory(notification: any) {
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

// Función para actualizar contador de notificaciones
async function updateNotificationCount(newCount: number) {
  try {
    const currentCount = await AsyncStorage.getItem('notificationCount');
    const count = currentCount ? parseInt(currentCount) : 0;
    await AsyncStorage.setItem('notificationCount', JSON.stringify(count + newCount));
  } catch (error) {
    console.error('Error al actualizar contador:', error);
  }
}

// Función para registrar la tarea en segundo plano
export async function registerBackgroundTask() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 10, // 10 segundos (mínimo permitido por el sistema)
      stopOnTerminate: false, // Continuar después de cerrar la app
      startOnBoot: true, // Iniciar al arrancar el dispositivo
    });
    
    console.log('✅ Tarea en segundo plano registrada');
  } catch (error) {
    console.error('❌ Error al registrar tarea en segundo plano:', error);
  }
}

// Función para desregistrar la tarea
export async function unregisterBackgroundTask() {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    console.log('✅ Tarea en segundo plano desregistrada');
  } catch (error) {
    console.error('❌ Error al desregistrar tarea en segundo plano:', error);
  }
}

// Función para verificar el estado de la tarea
export async function getBackgroundTaskStatus() {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    return status;
  } catch (error) {
    console.error('❌ Error al obtener estado de tarea en segundo plano:', error);
    return null;
  }
}

// Función para configurar permisos de notificaciones
export async function configureNotifications() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ Permisos de notificaciones no otorgados');
      return false;
    }
    
    // Configurar canal de notificaciones para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    console.log('✅ Notificaciones configuradas correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al configurar notificaciones:', error);
    return false;
  }
} 