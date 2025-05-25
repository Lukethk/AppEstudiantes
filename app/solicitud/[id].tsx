import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Solicitud {
  id_solicitud: number;
  materia_nombre: string;
  estado: string;
  fecha_hora_inicio: string;
  fecha_hora_fin?: string;
  descripcion?: string;
  observaciones?: string;
}

export default function SolicitudDetalleScreen() {
  const { id } = useLocalSearchParams();
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchSolicitud();
  }, [id]);

  const fetchSolicitud = async () => {
    try {
      const response = await fetch(`https://universidad-la9h.onrender.com/estudiantes/solicitudes/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar la solicitud');
      }

      const data = await response.json();
      setSolicitud(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la solicitud');
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#592644" />
      </View>
    );
  }

  if (!solicitud) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={[styles.errorText, isDark && styles.errorTextDark]}>
          No se encontró la solicitud
        </Text>
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
        <Text style={styles.headerTitle}>Detalles de Solicitud</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
              {solicitud.materia_nombre}
            </Text>
            <View style={[styles.badge, { backgroundColor: getEstadoColor(solicitud.estado) }]}>
              <Text style={styles.badgeText}>
                {solicitud.estado}
              </Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Fechas
            </Text>
            <View style={styles.infoRow}>
              <MaterialIcons name="event" size={20} color={isDark ? '#aaa' : '#666'} />
              <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                Inicio: {new Date(solicitud.fecha_hora_inicio).toLocaleString()}
              </Text>
            </View>
            {solicitud.fecha_hora_fin && (
              <View style={styles.infoRow}>
                <MaterialIcons name="event" size={20} color={isDark ? '#aaa' : '#666'} />
                <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                  Fin: {new Date(solicitud.fecha_hora_fin).toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          {solicitud.descripcion && (
            <View style={styles.infoSection}>
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Descripción
              </Text>
              <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                {solicitud.descripcion}
              </Text>
            </View>
          )}

          {solicitud.observaciones && (
            <View style={styles.infoSection}>
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Observaciones
              </Text>
              <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                {solicitud.observaciones}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
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
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  cardTitleDark: {
    color: '#fff',
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionTitleDark: {
    color: '#fff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  infoTextDark: {
    color: '#aaa',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  errorTextDark: {
    color: '#aaa',
  },
}); 