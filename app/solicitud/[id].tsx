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
  insumos: {
    id_insumo: number;
    nombre: string;
    cantidad_solicitada: number;
    unidad_medida: string;
  }[];
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
      const response = await fetch(`https://universidad-la9h.onrender.com/estudiantes/solicitudes/${id}`);
      if (!response.ok) throw new Error('Error al cargar la solicitud');
      const data = await response.json();
      setSolicitud(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la solicitud');
      router.back();
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
        return '#666';
    }
  };

  const handleEditar = () => {
    router.push(`/nueva-solicitud?id=${id}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color="#592644" />
      </View>
    );
  }

  if (!solicitud) {
    return (
      <View style={[styles.container, styles.centerContent, isDark && styles.containerDark]}>
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

          <View style={styles.infoSection}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Observaciones
            </Text>
            <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
              {solicitud.observaciones || 'Sin observaciones'}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Insumos Solicitados
            </Text>
            {solicitud.insumos && solicitud.insumos.length > 0 ? (
              solicitud.insumos.map((insumo, index) => (
                <View key={index} style={[styles.insumoItem, isDark && styles.insumoItemDark]}>
                  <View style={styles.insumoInfo}>
                    <Text style={[styles.insumoNombre, isDark && styles.insumoNombreDark]}>
                      {insumo.nombre}
                    </Text>
                    <Text style={[styles.insumoCantidad, isDark && styles.insumoCantidadDark]}>
                      Cantidad: {insumo.cantidad_solicitada} {insumo.unidad_medida}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
                No hay insumos solicitados
              </Text>
            )}
          </View>

          {(solicitud.estado.toLowerCase() === 'pendiente' || solicitud.estado.toLowerCase() === 'aprobada') && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditar}
            >
              <MaterialIcons name="edit" size={20} color="#fff" style={styles.editIcon} />
              <Text style={styles.editButtonText}>
                {solicitud.estado.toLowerCase() === 'aprobada' ? 'Agregar Insumos' : 'Editar Solicitud'}
              </Text>
            </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  cardTitleDark: {
    color: '#fff',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
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
    marginLeft: 10,
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
  editButton: {
    backgroundColor: '#592644',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  editIcon: {
    marginRight: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  insumoItem: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  insumoItemDark: {
    backgroundColor: '#2d2d2d',
  },
  insumoInfo: {
    flex: 1,
  },
  insumoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  insumoNombreDark: {
    color: '#fff',
  },
  insumoCantidad: {
    fontSize: 14,
    color: '#666',
  },
  insumoCantidadDark: {
    color: '#aaa',
  },
}); 