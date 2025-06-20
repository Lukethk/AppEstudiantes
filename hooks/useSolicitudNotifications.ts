import { useCallback } from 'react';
import { Alert } from 'react-native';
import { NOTIFICATION_CONFIG } from '../config/notifications.config';
import { useNotifications } from '../context/NotificationContext';
import LocalNotificationStorage from '../services/LocalNotificationStorage';
import { SolicitudNotification } from '../services/NotificationService';

export const useSolicitudNotifications = () => {
  const { sendLocalNotification } = useNotifications();
  const localStorage = LocalNotificationStorage.getInstance();

  // Notificación cuando una solicitud es aprobada
  const handleSolicitudAprobada = useCallback(async (solicitud: SolicitudNotification) => {
    try {
      // Verificar si ya existe una notificación para esta solicitud
      const alreadyExists = await localStorage.hasNotificationForSolicitud(
        solicitud.id_solicitud,
        NOTIFICATION_CONFIG.NOTIFICATION_TYPES.SOLICITUD_APROBADA
      );

      if (alreadyExists) {
        console.log('Notificación de solicitud aprobada ya existe');
        return;
      }

      const titulo = '¡Solicitud Aprobada! 🎉';
      const mensaje = `Tu solicitud para ${solicitud.materia_nombre} ha sido aprobada. Fecha: ${new Date(solicitud.fecha_hora_inicio).toLocaleDateString()}`;

      // Enviar notificación local
      await sendLocalNotification(titulo, mensaje, {
        solicitudId: solicitud.id_solicitud,
        tipo: NOTIFICATION_CONFIG.NOTIFICATION_TYPES.SOLICITUD_APROBADA,
        materia: solicitud.materia_nombre,
      });

      // Guardar en almacenamiento local
      await localStorage.saveNotification({
        titulo,
        mensaje,
        tipo: NOTIFICATION_CONFIG.NOTIFICATION_TYPES.SOLICITUD_APROBADA,
        solicitud_id: solicitud.id_solicitud,
        materia_nombre: solicitud.materia_nombre,
        observaciones: solicitud.observaciones,
      });

      console.log('Notificación de solicitud aprobada enviada y guardada');
    } catch (error) {
      console.error('Error al enviar notificación de solicitud aprobada:', error);
      Alert.alert(
        'Error',
        'No se pudo enviar la notificación de solicitud aprobada'
      );
    }
  }, [sendLocalNotification]);

  // Notificación cuando una solicitud es rechazada
  const handleSolicitudRechazada = useCallback(async (solicitud: SolicitudNotification) => {
    try {
      // Verificar si ya existe una notificación para esta solicitud
      const alreadyExists = await localStorage.hasNotificationForSolicitud(
        solicitud.id_solicitud,
        NOTIFICATION_CONFIG.NOTIFICATION_TYPES.SOLICITUD_RECHAZADA
      );

      if (alreadyExists) {
        console.log('Notificación de solicitud rechazada ya existe');
        return;
      }

      const titulo = 'Solicitud Rechazada ❌';
      const mensaje = `Tu solicitud para ${solicitud.materia_nombre} ha sido rechazada.${solicitud.observaciones ? ` Motivo: ${solicitud.observaciones}` : ''}`;

      // Enviar notificación local
      await sendLocalNotification(titulo, mensaje, {
        solicitudId: solicitud.id_solicitud,
        tipo: NOTIFICATION_CONFIG.NOTIFICATION_TYPES.SOLICITUD_RECHAZADA,
        materia: solicitud.materia_nombre,
        observaciones: solicitud.observaciones,
      });

      // Guardar en almacenamiento local
      await localStorage.saveNotification({
        titulo,
        mensaje,
        tipo: NOTIFICATION_CONFIG.NOTIFICATION_TYPES.SOLICITUD_RECHAZADA,
        solicitud_id: solicitud.id_solicitud,
        materia_nombre: solicitud.materia_nombre,
        observaciones: solicitud.observaciones,
      });

      console.log('Notificación de solicitud rechazada enviada y guardada');
    } catch (error) {
      console.error('Error al enviar notificación de solicitud rechazada:', error);
      Alert.alert(
        'Error',
        'No se pudo enviar la notificación de solicitud rechazada'
      );
    }
  }, [sendLocalNotification]);

  // Notificación cuando una solicitud cambia de estado
  const handleSolicitudEstadoCambiado = useCallback(async (solicitud: SolicitudNotification) => {
    try {
      const estado = solicitud.estado.toLowerCase();
      
      if (estado === 'aprobada') {
        await handleSolicitudAprobada(solicitud);
      } else if (estado === 'rechazada') {
        await handleSolicitudRechazada(solicitud);
      } else if (estado === 'pendiente') {
        // Verificar si ya existe una notificación para esta solicitud
        const alreadyExists = await localStorage.hasNotificationForSolicitud(
          solicitud.id_solicitud,
          NOTIFICATION_CONFIG.NOTIFICATION_TYPES.SOLICITUD_PENDIENTE
        );

        if (!alreadyExists) {
          const titulo = 'Solicitud en Revisión ⏳';
          const mensaje = `Tu solicitud para ${solicitud.materia_nombre} está siendo revisada.`;

          // Enviar notificación local
          await sendLocalNotification(titulo, mensaje, {
            solicitudId: solicitud.id_solicitud,
            tipo: NOTIFICATION_CONFIG.NOTIFICATION_TYPES.SOLICITUD_PENDIENTE,
            materia: solicitud.materia_nombre,
          });

          // Guardar en almacenamiento local
          await localStorage.saveNotification({
            titulo,
            mensaje,
            tipo: NOTIFICATION_CONFIG.NOTIFICATION_TYPES.SOLICITUD_PENDIENTE,
            solicitud_id: solicitud.id_solicitud,
            materia_nombre: solicitud.materia_nombre,
          });
        }
      }
    } catch (error) {
      console.error('Error al manejar cambio de estado de solicitud:', error);
    }
  }, [handleSolicitudAprobada, handleSolicitudRechazada, sendLocalNotification]);

  // Notificación de recordatorio para solicitudes próximas
  const handleRecordatorioSolicitud = useCallback(async (solicitud: SolicitudNotification) => {
    try {
      const fechaInicio = new Date(solicitud.fecha_hora_inicio);
      const ahora = new Date();
      const diferenciaHoras = (fechaInicio.getTime() - ahora.getTime()) / (1000 * 60 * 60);

      if (diferenciaHoras <= 24 && diferenciaHoras > 0) {
        // Verificar si ya existe una notificación de recordatorio para esta solicitud
        const alreadyExists = await localStorage.hasNotificationForSolicitud(
          solicitud.id_solicitud,
          NOTIFICATION_CONFIG.NOTIFICATION_TYPES.RECORDATORIO_SOLICITUD
        );

        if (!alreadyExists) {
          const titulo = 'Recordatorio de Solicitud ⏰';
          const mensaje = `Tu solicitud para ${solicitud.materia_nombre} comienza mañana. Prepárate para recoger los insumos.`;

          // Enviar notificación local
          await sendLocalNotification(titulo, mensaje, {
            solicitudId: solicitud.id_solicitud,
            tipo: NOTIFICATION_CONFIG.NOTIFICATION_TYPES.RECORDATORIO_SOLICITUD,
            materia: solicitud.materia_nombre,
            fechaInicio: solicitud.fecha_hora_inicio,
          });

          // Guardar en almacenamiento local
          await localStorage.saveNotification({
            titulo,
            mensaje,
            tipo: NOTIFICATION_CONFIG.NOTIFICATION_TYPES.RECORDATORIO_SOLICITUD,
            solicitud_id: solicitud.id_solicitud,
            materia_nombre: solicitud.materia_nombre,
          });
        }
      }
    } catch (error) {
      console.error('Error al enviar recordatorio de solicitud:', error);
    }
  }, [sendLocalNotification]);

  // Función para limpiar notificaciones antiguas
  const cleanOldNotifications = useCallback(async () => {
    try {
      await localStorage.cleanOldNotifications();
      console.log('Notificaciones antiguas limpiadas');
    } catch (error) {
      console.error('Error al limpiar notificaciones antiguas:', error);
    }
  }, []);

  return {
    handleSolicitudAprobada,
    handleSolicitudRechazada,
    handleSolicitudEstadoCambiado,
    handleRecordatorioSolicitud,
    cleanOldNotifications,
  };
}; 