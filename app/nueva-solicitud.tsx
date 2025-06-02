import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Insumo {
  id_insumo: number;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  tipo: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
}

interface InsumoSolicitado {
  id_insumo: number;
  nombre: string;
  cantidad_solicitada: number;
  unidad_medida: string;
}

interface Materia {
  id_materia: number;
  nombre: string;
  semestre_numero: number;
  carrera_nombre: string;
}

interface Solicitud {
  id_solicitud: number;
  id_materia: number;
  observaciones: string;
  estado: string;
  insumos: {
    id_insumo: number;
    cantidad_solicitada: number;
  }[];
}

export default function NuevaSolicitudScreen() {
  const { id } = useLocalSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [solicitudOriginal, setSolicitudOriginal] = useState<Solicitud | null>(null);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [insumosFiltrados, setInsumosFiltrados] = useState<Insumo[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [insumosSeleccionados, setInsumosSeleccionados] = useState<InsumoSolicitado[]>([]);
  const [loading, setLoading] = useState(true);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<Materia | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [showMateriaModal, setShowMateriaModal] = useState(false);
  const [showInsumosModal, setShowInsumosModal] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const { isDark } = useTheme();

  const esEdicionSoloAgregarInsumos = isEditing && (solicitudOriginal?.estado.toLowerCase() === 'pendiente' || solicitudOriginal?.estado.toLowerCase() === 'aprobada');

  useEffect(() => {
    fetchInsumos();
    fetchMaterias();
    if (id) {
      fetchSolicitud();
    }
  }, [id]);

  const fetchMaterias = async () => {
    try {
      const response = await fetch('https://universidad-la9h.onrender.com/materias');
      if (!response.ok) throw new Error('Error al cargar materias');
      const data = await response.json();
      setMaterias(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las materias');
    }
  };

  const fetchInsumos = async () => {
    try {
      const response = await fetch('https://universidad-la9h.onrender.com/insumos');
      if (!response.ok) throw new Error('Error al cargar insumos');
      const data = await response.json();
      setInsumos(data);
      setInsumosFiltrados(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los insumos');
    } finally {
      setLoading(false);
    }
  };

  const fetchSolicitud = async () => {
    try {
      const response = await fetch(`https://universidad-la9h.onrender.com/estudiantes/solicitudes/${id}`);
      if (!response.ok) throw new Error('Error al cargar la solicitud');
      const data = await response.json();
      
      setSolicitudOriginal(data);
      setIsEditing(true);
      
      // Cargar materia
      const materia = materias.find(m => m.id_materia === data.id_materia);
      if (materia) {
        setMateriaSeleccionada(materia);
      }

      // Cargar insumos
      const insumosSolicitados = await Promise.all(
        data.insumos.map(async (insumo: any) => {
          const response = await fetch(`https://universidad-la9h.onrender.com/insumos/${insumo.id_insumo}`);
          const insumoData = await response.json();
          return {
            id_insumo: insumo.id_insumo,
            nombre: insumoData.nombre,
            cantidad_solicitada: insumo.cantidad_solicitada,
            unidad_medida: insumoData.unidad_medida
          };
        })
      );
      setInsumosSeleccionados(insumosSolicitados);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la solicitud');
      router.back();
    }
  };

  const handleBusqueda = (texto: string) => {
    setBusqueda(texto);
    const filtrados = insumos.filter(insumo => 
      insumo.nombre.toLowerCase().includes(texto.toLowerCase()) ||
      insumo.descripcion?.toLowerCase().includes(texto.toLowerCase())
    );
    setInsumosFiltrados(filtrados);
  };

  const handleSeleccionarInsumo = (insumo: Insumo) => {
    const yaSeleccionado = insumosSeleccionados.find(i => i.id_insumo === insumo.id_insumo);
    if (yaSeleccionado) {
      Alert.alert('Aviso', 'Este insumo ya ha sido seleccionado');
      return;
    }

    setInsumosSeleccionados([
      ...insumosSeleccionados,
      {
        id_insumo: insumo.id_insumo,
        nombre: insumo.nombre,
        cantidad_solicitada: 1,
        unidad_medida: insumo.unidad_medida
      }
    ]);
    setBusqueda('');
    setInsumosFiltrados(insumos);
  };

  const handleEliminarInsumo = (id_insumo: number) => {
    if (isEditing && solicitudOriginal?.estado.toLowerCase() === 'aprobada') {
      Alert.alert('Error', 'No se pueden eliminar insumos de una solicitud aprobada');
      return;
    }
    setInsumosSeleccionados(insumosSeleccionados.filter(i => i.id_insumo !== id_insumo));
  };

  const handleCambiarCantidad = (id_insumo: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    
    if (isEditing && solicitudOriginal?.estado.toLowerCase() === 'aprobada') {
      const insumoOriginal = solicitudOriginal.insumos.find(i => i.id_insumo === id_insumo);
      if (insumoOriginal && nuevaCantidad < insumoOriginal.cantidad_solicitada) {
        Alert.alert('Error', 'No se puede reducir la cantidad de insumos en una solicitud aprobada');
        return;
      }
    }
    
    setInsumosSeleccionados(insumosSeleccionados.map(insumo => 
      insumo.id_insumo === id_insumo 
        ? { ...insumo, cantidad_solicitada: nuevaCantidad }
        : insumo
    ));
  };

  const animateSuccess = async () => {
    setShowSuccessAnimation(true);
    // Vibración corta para dar feedback
    Vibration.vibrate(200);
    
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1000),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setShowSuccessAnimation(false);
      router.replace('/');
    });
  };

  const handleSubmit = async () => {
    if (!materiaSeleccionada) {
      Alert.alert('Error', 'Por favor seleccione una materia');
      return;
    }

    if (insumosSeleccionados.length === 0) {
      Alert.alert('Error', 'Por favor seleccione al menos un insumo');
      return;
    }

    try {
      const id_estudiante = await AsyncStorage.getItem('id_estudiante');
      if (!id_estudiante) {
        Alert.alert('Error', 'No se pudo obtener el ID del estudiante');
        return;
      }

      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        Alert.alert('Error', 'No se encontró la información del usuario');
        return;
      }

      const { id_estudiante: storedId_estudiante } = JSON.parse(userData);

      // Si es edición y solo se pueden agregar insumos (pendiente o aprobada)
      if (esEdicionSoloAgregarInsumos) {
        const nuevosInsumos = insumosSeleccionados.filter(insumo => 
          !solicitudOriginal.insumos.some(i => i.id_insumo === insumo.id_insumo)
        );

        if (nuevosInsumos.length === 0) {
          Alert.alert('Aviso', 'No hay nuevos insumos para agregar');
          return;
        }

        const url = `https://universidad-la9h.onrender.com/estudiantes/solicitudes/${id}/agregar-insumos`;
        const requestData = {
          nuevos_insumos: nuevosInsumos.map(insumo => ({
            id_insumo: insumo.id_insumo,
            cantidad_solicitada: insumo.cantidad_solicitada
          }))
        };

        console.log('URL para agregar insumos:', url);
        console.log('Datos a enviar:', JSON.stringify(requestData, null, 2));

        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestData)
        });

        let errorMessage = '';
        try {
          const responseText = await response.text();
          console.log('Respuesta del servidor:', responseText);
          if (!response.ok) {
            try {
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.message || 'Error al agregar insumos';
            } catch (parseError) {
              if (responseText.includes('<!DOCTYPE html>')) {
                errorMessage = 'Error del servidor: Respuesta HTML inesperada';
              } else {
                errorMessage = `Error del servidor (${response.status}): ${responseText}`;
              }
            }
            throw new Error(errorMessage);
          } else {
            // Mostrar mensaje si el estado vuelve a Pendiente
            try {
              const data = JSON.parse(responseText);
              if (data.estado_solicitud && data.estado_solicitud === 'Pendiente') {
                Alert.alert('Aviso', 'La solicitud ha vuelto al estado Pendiente y deberá ser revisada nuevamente.');
              }
            } catch (e) { /* ignorar error de parseo */ }
          }
        } catch (error) {
          console.error('Error completo:', error);
          Alert.alert('Error', error instanceof Error ? error.message : 'Error desconocido');
          return;
        }

        animateSuccess();
        return;
      }

      // Para solicitudes pendientes o nuevas
      const solicitudData = isEditing
        ? {
            id_solicitud: Number(id),
            id_estudiante,
            id_materia: materiaSeleccionada.id_materia,
            observaciones,
            estado: (solicitudOriginal?.estado && solicitudOriginal.estado.charAt(0).toUpperCase() + solicitudOriginal.estado.slice(1).toLowerCase() === 'Pendiente')
              ? 'Pendiente'
              : capitalizarEstado(solicitudOriginal?.estado || 'Pendiente'),
            insumos: insumosSeleccionados.map(insumo => ({
              id_insumo: insumo.id_insumo,
              cantidad_solicitada: insumo.cantidad_solicitada
            }))
          }
        : {
            id_estudiante,
            id_materia: materiaSeleccionada.id_materia,
            observaciones,
            estado: 'Pendiente',
            insumos: insumosSeleccionados.map(insumo => ({
              id_insumo: insumo.id_insumo,
              cantidad_solicitada: insumo.cantidad_solicitada
            }))
          };

      const url = isEditing 
        ? `https://universidad-la9h.onrender.com/estudiantes/solicitudes/${id}`
        : 'https://universidad-la9h.onrender.com/estudiantes/solicitudes';

      console.log('URL:', url);
      console.log('Método:', isEditing ? 'PATCH' : 'POST');
      console.log('Datos a enviar:', JSON.stringify(solicitudData, null, 2));

      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(solicitudData)
      });

      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);

      let errorMessage = '';
      try {
        const responseText = await response.text();
        console.log('Respuesta del servidor:', responseText);
        
        if (!response.ok) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || `Error al ${isEditing ? 'actualizar' : 'crear'} la solicitud`;
          } catch (parseError) {
            // Si no es JSON, probablemente es HTML o texto plano
            if (responseText.includes('<!DOCTYPE html>')) {
              errorMessage = 'Error del servidor: Respuesta HTML inesperada';
            } else {
              errorMessage = `Error del servidor (${response.status}): ${responseText}`;
            }
          }
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error('Error completo:', error);
        Alert.alert('Error', error instanceof Error ? error.message : 'Error desconocido');
        return;
      }

      animateSuccess();

    } catch (error: unknown) {
      console.error('Error completo:', error);
      const errorMessage = error instanceof Error ? error.message : `Error al ${isEditing ? 'actualizar' : 'crear'} la solicitud`;
      Alert.alert('Error', errorMessage);
    }
  };

  const renderInsumoItem = ({ item }: { item: Insumo }) => (
    <TouchableOpacity
      style={[styles.insumoItem, isDark && styles.insumoItemDark]}
      onPress={() => handleSeleccionarInsumo(item)}
    >
      <View style={styles.insumoInfo}>
        <Text style={[styles.insumoNombre, isDark && styles.insumoNombreDark]}>
          {item.nombre}
        </Text>
        {item.descripcion && (
          <Text style={[styles.insumoDescripcion, isDark && styles.insumoDescripcionDark]}>
            {item.descripcion}
          </Text>
        )}
        <View style={styles.insumoDetalles}>
          <Text style={[styles.insumoStock, isDark && styles.insumoStockDark]}>
            Stock: {item.stock_actual} {item.unidad_medida}
          </Text>
          <Text style={[styles.insumoUbicacion, isDark && styles.insumoUbicacionDark]}>
            Ubicación: {item.ubicacion}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderInsumoSeleccionado = ({ item }: { item: InsumoSolicitado }) => {
    const esSolicitudAprobada = isEditing && solicitudOriginal?.estado.toLowerCase() === 'aprobada';
    const insumoOriginal = esSolicitudAprobada ? 
      solicitudOriginal?.insumos.find(i => i.id_insumo === item.id_insumo) : null;
    const esInsumoOriginal = insumoOriginal !== undefined;

    return (
      <View style={[styles.insumoSeleccionado, isDark && styles.insumoSeleccionadoDark]}>
        <View style={styles.insumoSeleccionadoInfo}>
          <Text style={[styles.insumoSeleccionadoNombre, isDark && styles.insumoSeleccionadoNombreDark]}>
            {item.nombre}
          </Text>
          <Text style={[styles.insumoSeleccionadoUnidad, isDark && styles.insumoSeleccionadoUnidadDark]}>
            {item.unidad_medida}
          </Text>
          {esSolicitudAprobada && esInsumoOriginal && insumoOriginal && (
            <Text style={[styles.insumoOriginalCantidad, isDark && styles.insumoOriginalCantidadDark]}>
              Cantidad original: {insumoOriginal.cantidad_solicitada}
            </Text>
          )}
        </View>
        <View style={styles.insumoSeleccionadoCantidad}>
          <TouchableOpacity
            style={[
              styles.cantidadButton,
              esSolicitudAprobada && esInsumoOriginal && item.cantidad_solicitada <= insumoOriginal!.cantidad_solicitada && styles.cantidadButtonDisabled
            ]}
            onPress={() => handleCambiarCantidad(item.id_insumo, item.cantidad_solicitada - 1)}
            disabled={esSolicitudAprobada && esInsumoOriginal && item.cantidad_solicitada <= insumoOriginal!.cantidad_solicitada}
          >
            <MaterialIcons name="remove" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.cantidadText, isDark && styles.cantidadTextDark]}>
            {item.cantidad_solicitada}
          </Text>
          <TouchableOpacity
            style={styles.cantidadButton}
            onPress={() => handleCambiarCantidad(item.id_insumo, item.cantidad_solicitada + 1)}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {!esSolicitudAprobada && (
          <TouchableOpacity
            style={styles.eliminarButton}
            onPress={() => handleEliminarInsumo(item.id_insumo)}
          >
            <MaterialIcons name="delete" size={24} color="#e53935" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#592644" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Solicitud' : 'Nueva Solicitud'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.form, isDark && styles.formDark]}>
          <TouchableOpacity
            style={[styles.materiaSelector, isDark && styles.materiaSelectorDark]}
            onPress={() => setShowMateriaModal(true)}
          >
            <Text style={[styles.materiaSelectorText, isDark && styles.materiaSelectorTextDark]}>
              {materiaSeleccionada ? materiaSeleccionada.nombre : 'Seleccionar Materia'}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color={isDark ? '#fff' : '#333'} />
          </TouchableOpacity>

          <TextInput
            style={[styles.observacionesInput, isDark && styles.observacionesInputDark]}
            placeholder="Observaciones..."
            placeholderTextColor={isDark ? '#666' : '#999'}
            value={observaciones}
            onChangeText={setObservaciones}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.insumosSelector, isDark && styles.insumosSelectorDark]}
            onPress={() => setShowInsumosModal(true)}
          >
            <View style={styles.insumosSelectorInfo}>
              <Text style={[styles.insumosSelectorTitle, isDark && styles.insumosSelectorTitleDark]}>
                Insumos Seleccionados
              </Text>
              <Text style={[styles.insumosSelectorCount, isDark && styles.insumosSelectorCountDark]}>
                {insumosSeleccionados.length} insumos
              </Text>
            </View>
            <MaterialIcons name="add-circle" size={24} color="#592644" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>
              {isEditing ? 'ACTUALIZAR SOLICITUD' : 'CREAR SOLICITUD'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showMateriaModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                Seleccionar Materia
              </Text>
              <TouchableOpacity onPress={() => setShowMateriaModal(false)}>
                <MaterialIcons name="close" size={24} color={isDark ? '#fff' : '#333'} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={materias}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.materiaItem, isDark && styles.materiaItemDark]}
                  onPress={() => {
                    setMateriaSeleccionada(item);
                    setShowMateriaModal(false);
                  }}
                >
                  <Text style={[styles.materiaItemNombre, isDark && styles.materiaItemNombreDark]}>
                    {item.nombre}
                  </Text>
                  <Text style={[styles.materiaItemDetalles, isDark && styles.materiaItemDetallesDark]}>
                    Semestre {item.semestre_numero} - {item.carrera_nombre}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id_materia.toString()}
            />
          </View>
        </View>
      )}

      {showInsumosModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                Seleccionar Insumos
              </Text>
              <TouchableOpacity onPress={() => setShowInsumosModal(false)}>
                <MaterialIcons name="close" size={24} color={isDark ? '#fff' : '#333'} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={24} color={isDark ? '#aaa' : '#666'} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, isDark && styles.searchInputDark]}
                placeholder="Buscar insumos..."
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={busqueda}
                onChangeText={handleBusqueda}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Insumos Seleccionados
              </Text>
              <FlatList
                data={insumosSeleccionados}
                renderItem={renderInsumoSeleccionado}
                keyExtractor={item => item.id_insumo.toString()}
                style={styles.insumosSeleccionadosList}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Resultados de Búsqueda
              </Text>
              <FlatList
                data={insumosFiltrados}
                renderItem={renderInsumoItem}
                keyExtractor={item => item.id_insumo.toString()}
                style={styles.insumosList}
              />
            </View>
          </View>
        </View>
      )}

      {showSuccessAnimation && (
        <View style={styles.successOverlay}>
          <Animated.View
            style={[
              styles.successContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim,
              },
            ]}
          >
            <View style={styles.checkmarkContainer}>
              <MaterialIcons name="check-circle" size={80} color="#4CAF50" />
            </View>
            <Text style={styles.successText}>¡Solicitud enviada con éxito!</Text>
          </Animated.View>
        </View>
      )}
    </KeyboardAvoidingView>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 15,
  },
  formDark: {
    backgroundColor: '#1a1a1a',
  },
  materiaSelector: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  materiaSelectorDark: {
    backgroundColor: '#2d2d2d',
  },
  materiaSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  materiaSelectorTextDark: {
    color: '#fff',
  },
  observacionesInput: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    height: 100,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  observacionesInputDark: {
    backgroundColor: '#2d2d2d',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchContainerDark: {
    backgroundColor: '#2d2d2d',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#333',
    fontSize: 16,
  },
  searchInputDark: {
    color: '#fff',
  },
  section: {
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
  insumosList: {
    maxHeight: 300,
  },
  insumosSeleccionadosList: {
    maxHeight: 200,
  },
  insumoItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
    marginBottom: 5,
  },
  insumoNombreDark: {
    color: '#fff',
  },
  insumoDescripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  insumoDescripcionDark: {
    color: '#aaa',
  },
  insumoDetalles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insumoStock: {
    fontSize: 12,
    color: '#666',
  },
  insumoStockDark: {
    color: '#aaa',
  },
  insumoUbicacion: {
    fontSize: 12,
    color: '#666',
  },
  insumoUbicacionDark: {
    color: '#aaa',
  },
  insumoSeleccionado: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  insumoSeleccionadoDark: {
    backgroundColor: '#2d2d2d',
  },
  insumoSeleccionadoInfo: {
    flex: 1,
  },
  insumoSeleccionadoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  insumoSeleccionadoNombreDark: {
    color: '#fff',
  },
  insumoSeleccionadoUnidad: {
    fontSize: 12,
    color: '#666',
  },
  insumoSeleccionadoUnidadDark: {
    color: '#aaa',
  },
  insumoSeleccionadoCantidad: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  cantidadButton: {
    backgroundColor: '#592644',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cantidadText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 10,
  },
  cantidadTextDark: {
    color: '#fff',
  },
  eliminarButton: {
    padding: 8,
  },
  submitButton: {
    backgroundColor: '#592644',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContentDark: {
    backgroundColor: '#2d2d2d',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalTitleDark: {
    color: '#fff',
  },
  materiaItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  materiaItemDark: {
    backgroundColor: '#1a1a1a',
  },
  materiaItemNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  materiaItemNombreDark: {
    color: '#fff',
  },
  materiaItemDetalles: {
    fontSize: 14,
    color: '#666',
  },
  materiaItemDetallesDark: {
    color: '#aaa',
  },
  insumosSelector: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  insumosSelectorDark: {
    backgroundColor: '#2d2d2d',
  },
  insumosSelectorInfo: {
    flex: 1,
  },
  insumosSelectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  insumosSelectorTitleDark: {
    color: '#fff',
  },
  insumosSelectorCount: {
    fontSize: 14,
    color: '#666',
  },
  insumosSelectorCountDark: {
    color: '#aaa',
  },
  modalSection: {
    marginBottom: 20,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  checkmarkContainer: {
    marginBottom: 20,
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  cantidadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  insumoOriginalCantidad: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  insumoOriginalCantidadDark: {
    color: '#aaa',
  },
});

function capitalizarEstado(estado: string) {
  if (!estado) return 'Pendiente';
  return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
} 