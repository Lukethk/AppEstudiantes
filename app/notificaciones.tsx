import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getNotificationColor } from '../config/notifications.config';
import { useTheme } from '../context/ThemeContext';
import LocalNotificationStorage, { LocalNotification } from '../services/LocalNotificationStorage';

export default function NotificacionesScreen() {
  const [notificaciones, setNotificaciones] = useState<LocalNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isDark } = useTheme();
  const localStorage = LocalNotificationStorage.getInstance();

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      const historial = await localStorage.getAllNotifications();
      setNotificaciones(historial);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setNotificaciones([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarNotificaciones();
  };

  const marcarComoLeida = async (notificacionId: string) => {
    try {
      await localStorage.markAsRead(notificacionId);
      setNotificaciones(prev => 
        prev.map(notif => 
          notif.id === notificacionId 
            ? { ...notif, leida: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'solicitud_aprobada':
        return 'check-circle';
      case 'solicitud_rechazada':
        return 'cancel';
      case 'solicitud_pendiente':
        return 'hourglass-empty';
      case 'recordatorio_solicitud':
        return 'schedule';
      default:
        return 'notifications';
    }
  };

  const renderNotificacion = ({ item }: { item: LocalNotification }) => (
    <TouchableOpacity
      style={[
        styles.notificacionCard,
        isDark && styles.notificacionCardDark,
        !item.leida && styles.notificacionNoLeida,
      ]}
      onPress={() => {
        if (!item.leida) {
          marcarComoLeida(item.id);
        }
        // Ya no navega a detalles de solicitud
      }}
    >
      <View style={styles.notificacionHeader}>
        <View style={styles.iconoContainer}>
          <MaterialIcons
            name={getIconoTipo(item.tipo) as any}
            size={24}
            color={getNotificationColor(item.tipo)}
          />
        </View>
        <View style={styles.notificacionInfo}>
          <Text style={[styles.titulo, isDark && styles.tituloDark]}>
            {item.titulo}
          </Text>
          <Text style={[styles.mensaje, isDark && styles.mensajeDark]}>
            {item.mensaje}
          </Text>
          <Text style={[styles.fecha, isDark && styles.fechaDark]}>
            {new Date(item.fecha_creacion).toLocaleString()}
          </Text>
        </View>
        {!item.leida && (
          <View style={styles.indicatorNoLeida} />
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color="#592644" />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={notificaciones}
        renderItem={renderNotificacion}
        keyExtractor={(item) => item.id}
        style={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#592644']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-none" size={48} color={isDark ? '#666' : '#999'} />
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
              No hay notificaciones
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#592644',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  lista: {
    flex: 1,
  },
  notificacionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificacionCardDark: {
    backgroundColor: '#2a2a2a',
  },
  notificacionNoLeida: {
    borderLeftWidth: 4,
    borderLeftColor: '#592644',
  },
  notificacionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconoContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  notificacionInfo: {
    flex: 1,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tituloDark: {
    color: '#fff',
  },
  mensaje: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  mensajeDark: {
    color: '#ccc',
  },
  fecha: {
    fontSize: 12,
    color: '#999',
  },
  fechaDark: {
    color: '#666',
  },
  indicatorNoLeida: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#592644',
    marginLeft: 8,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  emptyTextDark: {
    color: '#666',
  },
}); 