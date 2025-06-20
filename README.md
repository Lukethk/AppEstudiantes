# App de Estudiantes - Sistema de Notificaciones

## Descripción

Aplicación móvil desarrollada en React Native con Expo que permite a los estudiantes gestionar solicitudes académicas y recibir notificaciones automáticas cuando sus solicitudes son aprobadas o rechazadas.

## Características Principales

### 🔄 Actualización Automática en Segundo Plano
- **Tareas en segundo plano**: La app verifica automáticamente cambios cada 15 segundos incluso cuando está cerrada
- **Notificaciones push**: Recibe notificaciones inmediatas cuando se detectan cambios de estado
- **Persistencia**: Continúa funcionando después de cerrar la app y al reiniciar el dispositivo
- **Optimización**: Sistema inteligente que solo ejecuta cuando es necesario

### 📱 Notificaciones Push
- **Notificaciones locales**: Se generan automáticamente cuando se detectan cambios de estado
- **Historial de notificaciones**: Pantalla dedicada para ver todas las notificaciones recibidas
- **Badge de contador**: Muestra el número de notificaciones no leídas
- **Limpieza automática**: Elimina notificaciones antiguas automáticamente

### 🎨 Interfaz de Usuario
- **Modo oscuro/claro**: Soporte completo para ambos temas
- **Diseño moderno**: Interfaz intuitiva y fácil de usar
- **Navegación fluida**: Sistema de navegación optimizado

## Estructura del Proyecto

```
AppEstudiantes/
├── app/
│   ├── (tabs)/
│   │   └── index.tsx              # Pantalla principal
│   ├── notificaciones.tsx         # Historial de notificaciones
│   └── nueva-solicitud.tsx        # Crear nueva solicitud
├── components/
│   ├── NotificationBadge.tsx      # Badge de notificaciones
│   └── ...
├── context/
│   ├── NotificationContext.tsx    # Contexto de notificaciones
│   └── ThemeContext.tsx           # Contexto de tema
├── hooks/
│   ├── useAutoRefresh.ts          # Hook para actualización automática
│   ├── useBackgroundTasks.ts      # Hook para tareas en segundo plano
│   ├── useSolicitudNotifications.ts # Hook para notificaciones de solicitudes
│   └── useSolicitudStateMonitor.ts # Hook para monitoreo de estado
├── services/
│   ├── BackgroundTaskService.ts   # Servicio de tareas en segundo plano
│   └── NotificationService.ts     # Servicio de notificaciones
└── ...
```

## Sistema de Tareas en Segundo Plano

### Cómo Funciona

1. **Registro Automático**: Al iniciar la app, se registra automáticamente una tarea en segundo plano
2. **Ejecución Periódica**: El sistema ejecuta la tarea cada 15 segundos (mínimo permitido)
3. **Detección de Cambios**: Compara el estado actual con el estado anterior guardado
4. **Notificación Inmediata**: Si detecta cambios, envía notificaciones push automáticamente
5. **Persistencia**: Continúa funcionando incluso cuando la app está cerrada

### Características Técnicas

- **Background Fetch**: Utiliza `expo-background-fetch` para tareas en segundo plano
- **Task Manager**: Usa `expo-task-manager` para definir y gestionar tareas
- **Permisos**: Solicita automáticamente permisos de notificaciones y tareas en segundo plano
- **Optimización**: Solo ejecuta cuando hay conexión a internet y usuario autenticado

### Configuración del Sistema

#### Android
- **Permisos**: WAKE_LOCK, FOREGROUND_SERVICE, RECEIVE_BOOT_COMPLETED
- **Persistencia**: La tarea continúa después de cerrar la app
- **Arranque**: Se inicia automáticamente al reiniciar el dispositivo

#### iOS
- **Background Modes**: background-fetch, background-processing, remote-notification
- **Permisos**: Solicita permisos de notificaciones al iniciar
- **Optimización**: El sistema iOS puede limitar la frecuencia de ejecución

## Sistema de Notificaciones

### Tipos de Notificaciones

- **Solicitud Aprobada**: Cuando una solicitud cambia de "pendiente" a "aprobada"
- **Solicitud Rechazada**: Cuando una solicitud cambia de "pendiente" a "rechazada"
- **Recordatorios**: Notificaciones para solicitudes pendientes próximas a vencer

### Gestión de Notificaciones

- **Historial Completo**: Todas las notificaciones se guardan localmente
- **Marcado de Leídas**: Las notificaciones se marcan como leídas al tocarlas
- **Limpieza Automática**: Se eliminan automáticamente las notificaciones antiguas
- **Limpieza Manual**: Opción para eliminar todo el historial

## Instalación y Configuración

### Prerrequisitos

- Node.js (versión 16 o superior)
- Expo CLI
- Dispositivo móvil o emulador

### Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd AppEstudiantes
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia la aplicación:
```bash
npx expo start
```

### Configuración de Notificaciones

1. **Permisos**: La app solicitará permisos para notificaciones y tareas en segundo plano al iniciar
2. **Configuración Automática**: Se configura automáticamente sin intervención del usuario
3. **Verificación**: Puedes verificar que funciona enviando una solicitud desde la web y esperando la notificación

## Uso

### Pantalla Principal

- **Vista de Solicitudes**: Muestra todas tus solicitudes organizadas por estado
- **Filtros**: Puedes filtrar por "pendiente", "aprobada" o "rechazada"
- **Actualización Manual**: Desliza hacia abajo para actualizar manualmente
- **Actualización Automática**: Funciona automáticamente cada 15 segundos

### Notificaciones

- **Acceso Rápido**: Toca el ícono de notificaciones en el header
- **Historial Completo**: Ve a la pantalla de notificaciones para ver todo el historial
- **Notificaciones Push**: Recibe notificaciones incluso cuando la app está cerrada

## Características Técnicas

### Tecnologías Utilizadas

- **React Native**: Framework principal
- **Expo**: Plataforma de desarrollo
- **AsyncStorage**: Almacenamiento local
- **Expo Notifications**: Sistema de notificaciones
- **Expo Background Fetch**: Tareas en segundo plano
- **Expo Task Manager**: Gestión de tareas
- **TypeScript**: Tipado estático

### Arquitectura

- **Hooks Personalizados**: Lógica reutilizable y modular
- **Context API**: Gestión de estado global
- **Componentes Modulares**: Código organizado y mantenible
- **Servicios**: Lógica de negocio separada
- **Tareas en Segundo Plano**: Sistema robusto para actualizaciones automáticas

### Optimizaciones

- **Actualización Inteligente**: Solo se actualiza cuando es necesario
- **Gestión de Memoria**: Limpieza automática de datos antiguos
- **Optimización de Batería**: Sistema eficiente que minimiza el consumo
- **Caché Local**: Reduce llamadas al servidor
- **Persistencia**: Funciona continuamente sin intervención del usuario

## Solución de Problemas

### Las notificaciones no llegan en segundo plano

1. Verifica que hayas otorgado permisos de notificaciones
2. Asegúrate de que la app no esté en modo "No molestar"
3. En Android, verifica que la app no esté optimizada para batería
4. En iOS, verifica que las notificaciones estén habilitadas en configuración

### La actualización automática no funciona

1. Verifica que tengas conexión a internet
2. Asegúrate de estar autenticado en la app
3. Revisa los logs en la consola para errores
4. Reinicia la app para reconfigurar las tareas en segundo plano

### La app consume mucha batería

1. El sistema está optimizado para minimizar el consumo
2. Las tareas en segundo plano usan el mínimo de recursos necesario
3. Si hay problemas, verifica que no haya otras apps consumiendo batería

## Limitaciones del Sistema

### Android
- El sistema puede limitar las tareas en segundo plano en algunos dispositivos
- Las apps optimizadas para batería pueden tener restricciones adicionales

### iOS
- iOS tiene restricciones más estrictas para tareas en segundo plano
- El sistema puede ajustar la frecuencia de ejecución según el uso de la app

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

Para preguntas o soporte, contacta al equipo de desarrollo.

---

**Nota**: Esta aplicación está diseñada para funcionar sin backend de notificaciones, utilizando únicamente actualización automática y notificaciones locales con tareas en segundo plano.
