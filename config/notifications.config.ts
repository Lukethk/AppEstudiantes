// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  // Project ID de Expo para notificaciones push remotas
  // Obtén tu Project ID desde https://expo.dev
  PROJECT_ID: process.env.EXPO_PUBLIC_PROJECT_ID || null,
  
  // URL del servidor
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://universidad-la9h.onrender.com',
  
  // Configuración de notificaciones locales
  LOCAL_NOTIFICATIONS: {
    enabled: true,
    sound: 'default',
    vibrate: true,
  },
  
  // Configuración de notificaciones push remotas
  PUSH_NOTIFICATIONS: {
    enabled: !!process.env.EXPO_PUBLIC_PROJECT_ID,
    retryAttempts: 3,
    retryDelay: 1000, // ms
  },
  
  // Configuración del badge
  BADGE: {
    updateInterval: 30000, // ms (30 segundos)
    maxCount: 99,
  },
  
  // Tipos de notificaciones
  NOTIFICATION_TYPES: {
    SOLICITUD_APROBADA: 'solicitud_aprobada',
    SOLICITUD_RECHAZADA: 'solicitud_rechazada',
    SOLICITUD_PENDIENTE: 'solicitud_pendiente',
    RECORDATORIO_SOLICITUD: 'recordatorio_solicitud',
  },
  
  // Colores por tipo de notificación
  COLORS: {
    solicitud_aprobada: '#4caf50',
    solicitud_rechazada: '#e53935',
    solicitud_pendiente: '#f5a623',
    recordatorio_solicitud: '#2196f3',
    default: '#666',
  },
};

// Función para verificar si las notificaciones push están habilitadas
export const isPushNotificationsEnabled = (): boolean => {
  return NOTIFICATION_CONFIG.PUSH_NOTIFICATIONS.enabled && !!NOTIFICATION_CONFIG.PROJECT_ID;
};

// Función para obtener la configuración de colores
export const getNotificationColor = (tipo: string): string => {
  return NOTIFICATION_CONFIG.COLORS[tipo as keyof typeof NOTIFICATION_CONFIG.COLORS] || NOTIFICATION_CONFIG.COLORS.default;
}; 