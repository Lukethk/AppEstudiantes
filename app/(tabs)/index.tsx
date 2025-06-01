import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const { height } = Dimensions.get('window');

interface Solicitud {
  id_solicitud: number;
  materia_nombre: string;
  estado: string;
  fecha_hora_inicio: string;
  fecha_hora_fin?: string;
}

export default function HomeScreen() {
  const [filtro, setFiltro] = useState('pendiente');
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isDark } = useTheme();

  const fetchSolicitudes = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : null;
  
      if (!user || !user.id_estudiante) {
        throw new Error('Usuario no identificado');
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
      setSolicitudes(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSolicitudes();
  };

  const handleNuevaSolicitud = () => {
    router.push('/nueva-solicitud');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('userData');
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión correctamente');
            }
          }
        }
      ]
    );
  };

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return '#f5a623';
      case 'aprobada':
        return '#4caf50';
      case 'rechazada':
        return '#e53935';
      default:
        return '#ccc';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'hourglass-empty';
      case 'aprobada':
        return 'check-circle';
      case 'rechazada':
        return 'cancel';
      default:
        return 'help';
    }
  };

  const solicitudesFiltradas = solicitudes.filter(s => s.estado.toLowerCase() === filtro.toLowerCase());

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#592644" />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Solicitudes</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filtroContainer}>
        {['pendiente', 'aprobada', 'rechazada'].map(estado => (
          <TouchableOpacity 
            key={estado} 
            style={[
              styles.filtroButton, 
              filtro === estado && styles.filtroButtonActivo,
              isDark && styles.filtroButtonDark
            ]}
            onPress={() => setFiltro(estado)}
          >
            <Text style={[
              styles.filtroButtonText, 
              filtro === estado && styles.filtroButtonTextActivo,
              isDark && styles.filtroButtonTextDark
            ]}>
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#592644']}
          />
        }
      >
        {solicitudesFiltradas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="assignment" size={48} color={isDark ? '#666' : '#999'} />
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
              No hay solicitudes {filtro}
            </Text>
          </View>
        ) : (
          solicitudesFiltradas.map(solicitud => (
            <TouchableOpacity 
              key={solicitud.id_solicitud}
              style={[
                styles.card,
                isDark && styles.cardDark,
                { borderLeftColor: getEstadoColor(solicitud.estado) }
              ]}
              onPress={() => router.push(`/solicitud/${solicitud.id_solicitud}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
                  {solicitud.materia_nombre}
                </Text>
                <View style={[styles.badge, { backgroundColor: getEstadoColor(solicitud.estado) }]}>
                  <MaterialIcons 
                    name={getEstadoIcon(solicitud.estado)} 
                    size={16} 
                    color="#fff" 
                    style={styles.badgeIcon}
                  />
                  <Text style={styles.badgeText}>
                    {solicitud.estado}
                  </Text>
                </View>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <MaterialIcons name="event" size={20} color={isDark ? '#aaa' : '#666'} />
                  <Text style={[styles.cardText, isDark && styles.cardTextDark]}>
                    Inicio: {new Date(solicitud.fecha_hora_inicio).toLocaleString()}
                  </Text>
                </View>
                {solicitud.fecha_hora_fin && (
                  <View style={styles.infoRow}>
                    <MaterialIcons name="event" size={20} color={isDark ? '#aaa' : '#666'} />
                    <Text style={[styles.cardText, isDark && styles.cardTextDark]}>
                      Fin: {new Date(solicitud.fecha_hora_fin).toLocaleString()}
                    </Text>
                  </View>
                )}
                {solicitud.estado.toLowerCase() === 'aprobada' && (
                  <View style={styles.approvedInfo}>
                    <MaterialIcons name="check-circle" size={20} color="#4caf50" />
                    <Text style={[styles.approvedText, isDark && styles.approvedTextDark]}>
                      Solicitud aprobada
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.nuevaSolicitudButton}
        onPress={handleNuevaSolicitud}
      >
        <MaterialIcons name="add" size={24} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Nueva Solicitud</Text>
      </TouchableOpacity>
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
    backgroundColor: '#592644',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    position: 'absolute',
    right: 20,
    padding: 8,
  },
  filtroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#fff',
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  filtroButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filtroButtonDark: {
    backgroundColor: '#2d2d2d',
  },
  filtroButtonActivo: {
    backgroundColor: '#592644',
  },
  filtroButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  filtroButtonTextDark: {
    color: '#fff',
  },
  filtroButtonTextActivo: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyTextDark: {
    color: '#999',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#2d2d2d',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  cardTitleDark: {
    color: '#fff',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  cardTextDark: {
    color: '#aaa',
  },
  nuevaSolicitudButton: {
    backgroundColor: '#592644',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    margin: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeIcon: {
    marginRight: 4,
  },
  approvedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  approvedText: {
    color: '#4caf50',
    marginLeft: 8,
    fontWeight: '500',
  },
  approvedTextDark: {
    color: '#81c784',
  },
});
