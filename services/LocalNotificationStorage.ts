import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocalNotification {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  fecha_creacion: string;
  leida: boolean;
  solicitud_id?: number;
  materia_nombre?: string;
  observaciones?: string;
}

export class LocalNotificationStorage {
  private static instance: LocalNotificationStorage;
  private readonly STORAGE_KEY = 'local_notifications';
  private readonly UNREAD_COUNT_KEY = 'unread_notifications_count';

  private constructor() {}

  public static getInstance(): LocalNotificationStorage {
    if (!LocalNotificationStorage.instance) {
      LocalNotificationStorage.instance = new LocalNotificationStorage();
    }
    return LocalNotificationStorage.instance;
  }

  // Guardar una nueva notificación
  async saveNotification(notification: Omit<LocalNotification, 'id' | 'fecha_creacion' | 'leida'>): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      
      const newNotification: LocalNotification = {
        ...notification,
        id: this.generateId(),
        fecha_creacion: new Date().toISOString(),
        leida: false,
      };

      notifications.unshift(newNotification); // Agregar al inicio
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
      await this.updateUnreadCount();
      
      console.log('Notificación guardada localmente:', newNotification);
    } catch (error) {
      console.error('Error al guardar notificación local:', error);
    }
  }

  // Obtener todas las notificaciones
  async getAllNotifications(): Promise<LocalNotification[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener notificaciones locales:', error);
      return [];
    }
  }

  // Obtener notificaciones no leídas
  async getUnreadNotifications(): Promise<LocalNotification[]> {
    try {
      const notifications = await this.getAllNotifications();
      return notifications.filter(notification => !notification.leida);
    } catch (error) {
      console.error('Error al obtener notificaciones no leídas:', error);
      return [];
    }
  }

  // Marcar notificación como leída
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, leida: true }
          : notification
      );

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedNotifications));
      await this.updateUnreadCount();
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  }

  // Marcar todas como leídas
  async markAllAsRead(): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        leida: true,
      }));

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedNotifications));
      await this.updateUnreadCount();
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  }

  // Obtener contador de no leídas
  async getUnreadCount(): Promise<number> {
    try {
      const count = await AsyncStorage.getItem(this.UNREAD_COUNT_KEY);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Error al obtener contador de no leídas:', error);
      return 0;
    }
  }

  // Actualizar contador de no leídas
  private async updateUnreadCount(): Promise<void> {
    try {
      const unreadNotifications = await this.getUnreadNotifications();
      await AsyncStorage.setItem(this.UNREAD_COUNT_KEY, unreadNotifications.length.toString());
    } catch (error) {
      console.error('Error al actualizar contador de no leídas:', error);
    }
  }

  // Eliminar notificación
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const filteredNotifications = notifications.filter(
        notification => notification.id !== notificationId
      );

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredNotifications));
      await this.updateUnreadCount();
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  }

  // Limpiar todas las notificaciones
  async clearAllNotifications(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      await AsyncStorage.removeItem(this.UNREAD_COUNT_KEY);
    } catch (error) {
      console.error('Error al limpiar notificaciones:', error);
    }
  }

  // Limpiar notificaciones antiguas (más de 30 días)
  async cleanOldNotifications(): Promise<void> {
    try {
      const notifications = await this.getAllNotifications();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentNotifications = notifications.filter(notification => {
        const notificationDate = new Date(notification.fecha_creacion);
        return notificationDate > thirtyDaysAgo;
      });

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentNotifications));
      await this.updateUnreadCount();
    } catch (error) {
      console.error('Error al limpiar notificaciones antiguas:', error);
    }
  }

  // Generar ID único
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Verificar si ya existe una notificación para una solicitud específica
  async hasNotificationForSolicitud(solicitudId: number, tipo: string): Promise<boolean> {
    try {
      const notifications = await this.getAllNotifications();
      return notifications.some(notification => 
        notification.solicitud_id === solicitudId && notification.tipo === tipo
      );
    } catch (error) {
      console.error('Error al verificar notificación existente:', error);
      return false;
    }
  }
}

export default LocalNotificationStorage; 