import { useCallback, useRef } from 'react';
import { useSolicitudNotifications } from './useSolicitudNotifications';

interface Solicitud {
  id_solicitud: number;
  materia_nombre: string;
  estado: string;
  fecha_hora_inicio: string;
  fecha_hora_fin?: string;
}

export const useSolicitudStateMonitor = () => {
  const previousSolicitudes = useRef<Solicitud[]>([]);
  const { handleSolicitudEstadoCambiado, handleRecordatorioSolicitud } = useSolicitudNotifications();

  // Función para detectar cambios de estado
  const detectStateChanges = useCallback((currentSolicitudes: Solicitud[]) => {
    const changes: Array<{
      solicitud: Solicitud;
      oldEstado: string;
      newEstado: string;
    }> = [];

    currentSolicitudes.forEach(currentSolicitud => {
      const previousSolicitud = previousSolicitudes.current.find(
        s => s.id_solicitud === currentSolicitud.id_solicitud
      );

      if (previousSolicitud && previousSolicitud.estado !== currentSolicitud.estado) {
        changes.push({
          solicitud: currentSolicitud,
          oldEstado: previousSolicitud.estado,
          newEstado: currentSolicitud.estado,
        });
      }
    });

    return changes;
  }, []);

  // Función para procesar cambios de estado
  const processStateChanges = useCallback((solicitudes: Solicitud[]) => {
    const changes = detectStateChanges(solicitudes);
    
    changes.forEach(change => {
      console.log(`🔄 Estado cambiado para solicitud ${change.solicitud.id_solicitud}: ${change.oldEstado} → ${change.newEstado}`);
      
      handleSolicitudEstadoCambiado({
        id_solicitud: change.solicitud.id_solicitud,
        estado: change.solicitud.estado,
        materia_nombre: change.solicitud.materia_nombre,
        fecha_hora_inicio: change.solicitud.fecha_hora_inicio,
      });
    });

    // Actualizar referencia para la próxima comparación
    previousSolicitudes.current = solicitudes;
  }, [detectStateChanges, handleSolicitudEstadoCambiado]);

  // Función para inicializar el monitor
  const initializeMonitor = useCallback((solicitudes: Solicitud[]) => {
    previousSolicitudes.current = solicitudes;
    console.log('📱 Monitor de estado de solicitudes inicializado');
  }, []);

  // Función para verificar recordatorios
  const checkReminders = useCallback((solicitudes: Solicitud[]) => {
    solicitudes.forEach(solicitud => {
      if (solicitud.estado.toLowerCase() === 'aprobada') {
        handleRecordatorioSolicitud({
          id_solicitud: solicitud.id_solicitud,
          estado: solicitud.estado,
          materia_nombre: solicitud.materia_nombre,
          fecha_hora_inicio: solicitud.fecha_hora_inicio,
        });
      }
    });
  }, [handleRecordatorioSolicitud]);

  return {
    processStateChanges,
    initializeMonitor,
    checkReminders,
  };
}; 