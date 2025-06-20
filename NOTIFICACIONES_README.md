# Sistema de Notificaciones - AppEstudiantes

## Descripción

Este sistema de notificaciones permite a los estudiantes recibir notificaciones push cuando sus solicitudes de insumos son aprobadas o rechazadas desde tu web, así como recordatorios para solicitudes próximas. **Funciona completamente offline** y detecta automáticamente los cambios de estado.

## Características

- ✅ **Notificaciones completamente locales** - No requiere backend
- ✅ **Detección automática de cambios** - Detecta cuando apruebas/rechazas desde tu web
- ✅ **Almacenamiento local** - Notificaciones guardadas en el dispositivo
- ✅ **Notificaciones push locales** - Funcionan sin internet
- ✅ **Historial persistente** - Se mantiene entre sesiones
- ✅ **Badge con contador** - Muestra notificaciones no leídas
- ✅ **Sin duplicados** - Evita notificaciones repetidas
- ✅ **Limpieza automática** - Elimina notificaciones antiguas

## Cómo Funciona

### 1. Detección de Cambios
- La app consulta periódicamente el estado de las solicitudes
- Compara con el estado anterior almacenado localmente
- Detecta automáticamente cuando cambias el estado desde tu web
- Envía notificación inmediatamente al detectar cambio

### 2. Almacenamiento Local
- Todas las notificaciones se guardan en AsyncStorage
- Persisten entre sesiones de la app
- Se limpian automáticamente después de 30 días
- No requieren conexión a internet

### 3. Notificaciones Push
- Se envían inmediatamente al detectar cambios
- Funcionan completamente offline
- Incluyen sonido y vibración
- Se muestran en el centro de notificaciones

## Configuración

### 1. Configuración de Expo

Asegúrate de tener configurado tu `app.json` con los permisos necesarios:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "NOTIFICATIONS",
        "VIBRATE",
        "RECEIVE_BOOT_COMPLETED",
        "WAKE_LOCK"
      ]
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#592644"
        }
      ]
    ]
  }
}
```

### 2. Configuración Opcional (Push Remotas)

Si quieres notificaciones push remotas adicionales, configura tu Project ID:

```bash
# En tu archivo .env o variables de entorno
EXPO_PUBLIC_PROJECT_ID=tu-project-id-real
```

O modifica directamente `config/notifications.config.ts`:

```typescript
export const NOTIFICATION_CONFIG = {
  PROJECT_ID: 'tu-project-id-real', // Opcional
  // ... resto de configuración
};
```

## Uso

### 1. Flujo Automático

1. **Estudiante crea solicitud** → Estado: "pendiente"
2. **Administrador aprueba/rechaza desde web** → Estado cambia
3. **App detecta cambio automáticamente** → Envía notificación
4. **Estudiante recibe notificación** → Ve el cambio en tiempo real

### 2. Tipos de Notificaciones

#### Solicitud Aprobada
- **Cuándo**: Estado cambia a "aprobada"
- **Título**: "¡Solicitud Aprobada! 🎉"
- **Mensaje**: Incluye materia y fecha
- **Color**: Verde (#4caf50)

#### Solicitud Rechazada
- **Cuándo**: Estado cambia a "rechazada"
- **Título**: "Solicitud Rechazada ❌"
- **Mensaje**: Incluye materia y motivo (si existe)
- **Color**: Rojo (#e53935)

#### Recordatorio
- **Cuándo**: Solicitud aprobada está próxima (24h antes)
- **Título**: "Recordatorio de Solicitud ⏰"
- **Mensaje**: Aviso de solicitud próxima
- **Color**: Azul (#2196f3)

### 3. Historial de Notificaciones

- Toca el botón de notificaciones en la pantalla principal
- Las notificaciones se marcan como leídas al tocarlas
- **No se puede navegar a detalles de solicitudes desde el historial**
- Se mantienen hasta 30 días

## Archivos Principales

### Almacenamiento Local
- `services/LocalNotificationStorage.ts` - Gestión de notificaciones locales

### Configuración
- `config/notifications.config.ts` - Configuración centralizada

### Contextos
- `context/NotificationContext.tsx` - Contexto principal de notificaciones

### Hooks
- `hooks/useSolicitudNotifications.ts` - Hook para notificaciones
- `hooks/useSolicitudStateMonitor.ts` - Monitor de cambios de estado

### Componentes
- `components/NotificationBadge.tsx` - Badge con contador

### Pantallas
- `app/notificaciones.tsx` - Pantalla de historial
- `app/(tabs)/index.tsx` - Pantalla principal con monitor

## Ventajas del Sistema Local

### ✅ **Sin Dependencias del Backend**
- No necesitas endpoints de notificaciones
- Funciona con tu API actual
- No requiere cambios en tu web

### ✅ **Funcionamiento Offline**
- Notificaciones funcionan sin internet
- Datos se mantienen localmente
- Sincronización automática al conectar

### ✅ **Detección Inteligente**
- Compara estados automáticamente
- Evita notificaciones duplicadas
- Detecta cambios en tiempo real

### ✅ **Rendimiento Optimizado**
- Consultas mínimas al servidor
- Almacenamiento eficiente
- Limpieza automática de datos

## Personalización

### Configuración Centralizada

Todas las configuraciones están en `config/notifications.config.ts`:

```typescript
export const NOTIFICATION_CONFIG = {
  // Project ID de Expo (opcional)
  PROJECT_ID: process.env.EXPO_PUBLIC_PROJECT_ID || null,
  
  // URL del servidor
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://universidad-la9h.onrender.com',
  
  // Configuración de notificaciones locales
  LOCAL_NOTIFICATIONS: {
    enabled: true,
    sound: 'default',
    vibrate: true,
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
```

### Sonidos Personalizados

Para agregar sonidos personalizados:

1. Agrega archivos de sonido en `assets/sounds/`
2. Actualiza `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "sounds": [
            "./assets/sounds/notification.wav",
            "./assets/sounds/approval.wav",
            "./assets/sounds/rejection.wav"
          ]
        }
      ]
    ]
  }
}
```

## Solución de Problemas

### 1. Notificaciones no aparecen
- Verifica que los permisos estén habilitados
- Revisa la consola para logs de detección
- Asegúrate de que el estado cambió realmente

### 2. Badge no se actualiza
- El badge se actualiza cada 30 segundos
- Verifica que hay notificaciones no leídas
- Revisa el almacenamiento local

### 3. Detección no funciona
- Verifica la conexión al servidor
- Revisa los logs de comparación de estados
- Asegúrate de que la app se actualiza periódicamente

### 4. Notificaciones duplicadas
- El sistema evita duplicados automáticamente
- Verifica que no haya múltiples instancias
- Revisa el historial local

## Próximas Mejoras

- [ ] Notificaciones programadas para recordatorios
- [ ] Configuración de preferencias de notificaciones
- [ ] Notificaciones por categoría de insumo
- [ ] Integración con calendario
- [ ] Notificaciones de grupo para materias similares
- [ ] Sincronización con la nube (opcional)

## Soporte

Para problemas o preguntas sobre el sistema de notificaciones, revisa:

1. Los logs de la consola (busca emojis 🔄📱)
2. El almacenamiento local en AsyncStorage
3. La configuración en `config/notifications.config.ts`
4. Los permisos de notificaciones 