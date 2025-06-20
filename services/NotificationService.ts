import AsyncStorage from '@react-native-async-storage/async-storage';
import { NOTIFICATION_CONFIG } from '../config/notifications.config';

export interface SolicitudNotification {
  id_solicitud: number;
  estado: string;
  materia_nombre: string;
  fecha_hora_inicio: string;
  observaciones?: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private baseUrl = NOTIFICATION_CONFIG.API_URL;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Enviar notificación cuando una solicitud es aprobada
  async sendSolicitudAprobadaNotification(solicitud: SolicitudNotification) {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : null;

      if (!user || !user.id_estudiante) {
        throw new Error('Usuario no identificado');
      }

      const response = await fetch(`${this.baseUrl}/notificaciones/solicitud-aprobada`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_estudiante: user.id_estudiante,
          id_solicitud: solicitud.id_solicitud,
          materia_nombre: solicitud.materia_nombre,
          fecha_hora_inicio: solicitud.fecha_hora_inicio,
          observaciones: solicitud.observaciones,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar notificación de solicitud aprobada');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en sendSolicitudAprobadaNotification:', error);
      throw error;
    }
  }

  // Enviar notificación cuando una solicitud es rechazada
  async sendSolicitudRechazadaNotification(solicitud: SolicitudNotification) {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : null;

      if (!user || !user.id_estudiante) {
        throw new Error('Usuario no identificado');
      }

      const response = await fetch(`${this.baseUrl}/notificaciones/solicitud-rechazada`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_estudiante: user.id_estudiante,
          id_solicitud: solicitud.id_solicitud,
          materia_nombre: solicitud.materia_nombre,
          fecha_hora_inicio: solicitud.fecha_hora_inicio,
          observaciones: solicitud.observaciones,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar notificación de solicitud rechazada');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en sendSolicitudRechazadaNotification:', error);
      throw error;
    }
  }

  // Obtener historial de notificaciones
  async getNotificationHistory() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : null;

      if (!user || !user.id_estudiante) {
        throw new Error('Usuario no identificado');
      }

      const response = await fetch(`${this.baseUrl}/notificaciones/historial?id_estudiante=${user.id_estudiante}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener historial de notificaciones');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getNotificationHistory:', error);
      throw error;
    }
  }

  // Marcar notificación como leída
  async markNotificationAsRead(notificationId: number) {
    try {
      const response = await fetch(`${this.baseUrl}/notificaciones/marcar-leida`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_notificacion: notificationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al marcar notificación como leída');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en markNotificationAsRead:', error);
      throw error;
    }
  }

  // Obtener notificaciones no leídas
  async getUnreadNotifications() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : null;

      if (!user || !user.id_estudiante) {
        throw new Error('Usuario no identificado');
      }

      const response = await fetch(`${this.baseUrl}/notificaciones/no-leidas?id_estudiante=${user.id_estudiante}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener notificaciones no leídas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getUnreadNotifications:', error);
      throw error;
    }
  }
}

export default NotificationService; 