import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef } from 'react';

interface UseAutoRefreshOptions {
  onRefresh: () => Promise<void>;
  onStateChange?: (solicitudes: any[]) => void;
}

export const useAutoRefresh = ({
  onRefresh,
  onStateChange,
}: UseAutoRefreshOptions) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSolicitudesRef = useRef<any[]>([]);

  const compareSolicitudes = useCallback((newSolicitudes: any[], oldSolicitudes: any[]) => {
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
  }, []);

  const fetchSolicitudes = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : null;

      if (!user || !user.id_estudiante) {
        return;
      }

      const response = await fetch(`https://universidad-la9h.onrender.com/estudiantes/solicitudes?id_estudiante=${user.id_estudiante}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar las solicitudes');
      }

      const data = await response.json();
      
      const changes = compareSolicitudes(data, lastSolicitudesRef.current);
      
      if (changes.length > 0) {
        console.log('🔄 Cambios detectados automáticamente:', changes);
        
        if (onStateChange) {
          onStateChange(data);
        }
      }

      lastSolicitudesRef.current = data;
      
      await onRefresh();
      
    } catch (error) {
      console.error('Error en actualización automática:', error);
    }
  }, [onRefresh, onStateChange, compareSolicitudes]);

  const startInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      console.log('🔄 Actualización automática ejecutándose...');
      fetchSolicitudes();
    }, 10000);

    console.log('🔄 Actualización automática iniciada cada 10 segundos');
  }, [fetchSolicitudes]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('🔄 Actualización automática detenida');
    }
  }, []);

  useEffect(() => {
    startInterval();

    return () => {
      stopInterval();
    };
  }, [startInterval, stopInterval]);

  const refreshNow = useCallback(async () => {
    console.log('🔄 Actualización manual ejecutándose...');
    await fetchSolicitudes();
  }, [fetchSolicitudes]);

  return {
    refreshNow,
    isEnabled: true,
    currentInterval: 10000,
  };
}; 