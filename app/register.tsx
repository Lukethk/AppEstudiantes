import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { height } = Dimensions.get('window');

const FACULTADES = [
  {
    id: 'informatica_electronica',
    nombre: 'Informática y Electrónica',
    icon: 'computer' as const
  }
];

interface Carrera {
  id_carrera: number;
  nombre: string;
  siglas: string;
}

interface Materia {
  id_materia: number;
  nombre: string;
  semestre_numero: number;
  carrera_nombre: string;
}

interface FormData {
  nombre: string;
  apellido: string;
  correo: string;
  contrasena: string;
  facultad: string;
  id_carrera: string;
  id_materia: string;
  [key: string]: string; // Índice de firma para permitir acceso dinámico
}

export default function RegisterScreen() {
  const expandAnim = useRef(new Animated.Value(305)).current;
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    facultad: '',
    id_carrera: '',
    id_materia: ''
  });
  const [showFacultades, setShowFacultades] = useState(false);
  const [showCarreras, setShowCarreras] = useState(false);
  const [showMaterias, setShowMaterias] = useState(false);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchCarreras();
    fetchMaterias();
  }, []);

  const fetchCarreras = async () => {
    try {
      const response = await fetch('https://universidad-la9h.onrender.com/carreras');
      const data = await response.json();
      setCarreras(data);
    } catch (error) {
      console.error('Error al cargar carreras:', error);
    }
  };

  const fetchMaterias = async () => {
    try {
      const response = await fetch('https://universidad-la9h.onrender.com/materias');
      const data = await response.json();
      setMaterias(data);
    } catch (error) {
      console.error('Error al cargar materias:', error);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectFacultad = (facultad: string) => {
    handleChange('facultad', facultad);
    setShowFacultades(false);
  };

  const handleSelectCarrera = (id_carrera: string) => {
    handleChange('id_carrera', id_carrera);
    setShowCarreras(false);
  };

  const handleSelectMateria = (id_materia: string) => {
    handleChange('id_materia', id_materia);
    setShowMaterias(false);
  };

  const getFacultadNombre = (id: string) => {
    const facultad = FACULTADES.find(f => f.id === id);
    return facultad ? facultad.nombre : '';
  };

  const getFacultadIcon = (id: string): keyof typeof MaterialIcons.glyphMap => {
    const facultad = FACULTADES.find(f => f.id === id);
    return (facultad ? facultad.icon : 'school') as keyof typeof MaterialIcons.glyphMap;
  };

  const getCarreraNombre = (id: string) => {
    const carrera = carreras.find(c => c.id_carrera.toString() === id);
    return carrera ? `${carrera.nombre} (${carrera.siglas})` : '';
  };

  const getMateriaNombre = (id: string) => {
    const materia = materias.find(m => m.id_materia.toString() === id);
    return materia ? `${materia.nombre} - Semestre ${materia.semestre_numero}` : '';
  };

  const handleRegister = async () => {
    // Validar campos requeridos
    const requiredFields = ['nombre', 'apellido', 'correo', 'contrasena', 'facultad', 'id_carrera', 'id_materia'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      return Alert.alert('Error', 'Por favor completa todos los campos requeridos.');
    }

    setLoading(true);

    try {
      const response = await fetch('https://universidad-la9h.onrender.com/estudiantes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar estudiante');
      }

      Alert.alert('Éxito', 'Registro completado exitosamente', [
        {
          text: 'OK',
          onPress: () => router.replace('/login')
        }
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al registrar estudiante');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const keyboardDidShow = () => {
      Animated.timing(expandAnim, {
        toValue: 150,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    const keyboardDidHide = () => {
      Animated.timing(expandAnim, {
        toValue: 305,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

    if (Platform.OS === 'ios') {
      const showSubscription = Keyboard.addListener('keyboardWillShow', keyboardDidShow);
      const hideSubscription = Keyboard.addListener('keyboardWillHide', keyboardDidHide);
      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }
  }, []);

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image 
            source={require('../assets/images/logo-2.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={[styles.formContainer, isDark && styles.formContainerDark]}>
          <View style={styles.titleContainer}>
            <Text style={[styles.titulo, isDark && styles.tituloDark]}>Laboratorios</Text>
            <Text style={[styles.titulo2, isDark && styles.titulo2Dark]}>Univalle</Text>
            <Text style={[styles.titulo3, isDark && styles.titulo3Dark]}>Crear Cuenta</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Información Personal</Text>
            
            <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
              <MaterialIcons name="person" size={24} color={isDark ? '#aaa' : '#999'} style={styles.inputIcon} />
              <TextInput
                style={[styles.inputText, isDark && styles.inputTextDark]}
                placeholder="Nombre"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.nombre}
                onChangeText={(value) => handleChange('nombre', value)}
              />
            </View>

            <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
              <MaterialIcons name="person" size={24} color={isDark ? '#aaa' : '#999'} style={styles.inputIcon} />
              <TextInput
                style={[styles.inputText, isDark && styles.inputTextDark]}
                placeholder="Apellido"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.apellido}
                onChangeText={(value) => handleChange('apellido', value)}
              />
            </View>

            <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
              <MaterialIcons name="email" size={24} color={isDark ? '#aaa' : '#999'} style={styles.inputIcon} />
              <TextInput
                style={[styles.inputText, isDark && styles.inputTextDark]}
                placeholder="Correo Electrónico"
                keyboardType="email-address"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.correo}
                onChangeText={(value) => handleChange('correo', value)}
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
              <MaterialIcons name="lock" size={24} color={isDark ? '#aaa' : '#999'} style={styles.inputIcon} />
              <TextInput
                style={[styles.inputText, isDark && styles.inputTextDark]}
                placeholder="Contraseña"
                secureTextEntry
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.contrasena}
                onChangeText={(value) => handleChange('contrasena', value)}
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>Información Académica</Text>
            
            <TouchableOpacity 
              style={[styles.inputWrapper, isDark && styles.inputWrapperDark]} 
              onPress={() => setShowFacultades(true)}
            >
              <MaterialIcons 
                name={getFacultadIcon(formData.facultad)} 
                size={24} 
                color={isDark ? '#aaa' : '#999'} 
                style={styles.inputIcon} 
              />
              <View style={styles.inputTextContainer}>
                <Text style={[
                  styles.inputText, 
                  isDark && styles.inputTextDark,
                  !formData.facultad && styles.placeholderText
                ]}>
                  {formData.facultad ? getFacultadNombre(formData.facultad) : 'Selecciona tu Facultad'}
                </Text>
              </View>
              <MaterialIcons 
                name="arrow-drop-down" 
                size={24} 
                color={isDark ? '#aaa' : '#999'} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.inputWrapper, isDark && styles.inputWrapperDark]} 
              onPress={() => setShowCarreras(true)}
            >
              <MaterialIcons 
                name="school" 
                size={24} 
                color={isDark ? '#aaa' : '#999'} 
                style={styles.inputIcon} 
              />
              <View style={styles.inputTextContainer}>
                <Text style={[
                  styles.inputText, 
                  isDark && styles.inputTextDark,
                  !formData.id_carrera && styles.placeholderText
                ]}>
                  {formData.id_carrera ? getCarreraNombre(formData.id_carrera) : 'Selecciona tu Carrera'}
                </Text>
                {formData.id_carrera && (
                  <Text style={[styles.inputSubtext, isDark && styles.inputSubtextDark]}>
                    {carreras.find(c => c.id_carrera.toString() === formData.id_carrera)?.siglas}
                  </Text>
                )}
              </View>
              <MaterialIcons 
                name="arrow-drop-down" 
                size={24} 
                color={isDark ? '#aaa' : '#999'} 
              />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.inputWrapper, isDark && styles.inputWrapperDark]} 
              onPress={() => setShowMaterias(true)}
            >
              <MaterialIcons 
                name="book" 
                size={24} 
                color={isDark ? '#aaa' : '#999'} 
                style={styles.inputIcon} 
              />
              <View style={styles.inputTextContainer}>
                <Text style={[
                  styles.inputText, 
                  isDark && styles.inputTextDark,
                  !formData.id_materia && styles.placeholderText
                ]}>
                  {formData.id_materia ? getMateriaNombre(formData.id_materia) : 'Selecciona tu Materia'}
                </Text>
                {formData.id_materia && (
                  <Text style={[styles.inputSubtext, isDark && styles.inputSubtextDark]}>
                    {materias.find(m => m.id_materia.toString() === formData.id_materia)?.carrera_nombre}
                  </Text>
                )}
              </View>
              <MaterialIcons 
                name="arrow-drop-down" 
                size={24} 
                color={isDark ? '#aaa' : '#999'} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'REGISTRANDO...' : 'REGISTRARSE'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Facultades */}
      <Modal
        visible={showFacultades}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFacultades(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFacultades(false)}
        >
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                Facultad
              </Text>
              <TouchableOpacity onPress={() => setShowFacultades(false)}>
                <MaterialIcons 
                  name="close" 
                  size={24} 
                  color={isDark ? '#fff' : '#333'} 
                />
              </TouchableOpacity>
            </View>
            {FACULTADES.map((facultad) => (
              <TouchableOpacity
                key={facultad.id}
                style={[
                  styles.optionItem,
                  isDark && styles.optionItemDark,
                  formData.facultad === facultad.id && styles.optionItemSelected
                ]}
                onPress={() => handleSelectFacultad(facultad.id)}
              >
                <MaterialIcons 
                  name={facultad.icon} 
                  size={24} 
                  color={isDark ? '#fff' : '#333'} 
                  style={styles.optionIcon} 
                />
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.optionText,
                    isDark && styles.optionTextDark
                  ]}>
                    {facultad.nombre}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de Carreras */}
      <Modal
        visible={showCarreras}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCarreras(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCarreras(false)}
        >
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                Selecciona tu Carrera
              </Text>
              <TouchableOpacity onPress={() => setShowCarreras(false)}>
                <MaterialIcons 
                  name="close" 
                  size={24} 
                  color={isDark ? '#fff' : '#333'} 
                />
              </TouchableOpacity>
            </View>
            {carreras.map((carrera) => (
              <TouchableOpacity
                key={carrera.id_carrera}
                style={[
                  styles.optionItem,
                  isDark && styles.optionItemDark,
                  formData.id_carrera === carrera.id_carrera.toString() && styles.optionItemSelected
                ]}
                onPress={() => handleSelectCarrera(carrera.id_carrera.toString())}
              >
                <MaterialIcons 
                  name="school" 
                  size={24} 
                  color={isDark ? '#fff' : '#333'} 
                  style={styles.optionIcon} 
                />
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.optionText,
                    isDark && styles.optionTextDark
                  ]}>
                    {carrera.nombre}
                  </Text>
                  <Text style={[
                    styles.optionSubtext,
                    isDark && styles.optionSubtextDark
                  ]}>
                    {carrera.siglas}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de Materias */}
      <Modal
        visible={showMaterias}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMaterias(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMaterias(false)}
        >
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
                Selecciona tu Materia
              </Text>
              <TouchableOpacity onPress={() => setShowMaterias(false)}>
                <MaterialIcons 
                  name="close" 
                  size={24} 
                  color={isDark ? '#fff' : '#333'} 
                />
              </TouchableOpacity>
            </View>
            {materias.map((materia) => (
              <TouchableOpacity
                key={materia.id_materia}
                style={[
                  styles.optionItem,
                  isDark && styles.optionItemDark,
                  formData.id_materia === materia.id_materia.toString() && styles.optionItemSelected
                ]}
                onPress={() => handleSelectMateria(materia.id_materia.toString())}
              >
                <MaterialIcons 
                  name="book" 
                  size={24} 
                  color={isDark ? '#fff' : '#333'} 
                  style={styles.optionIcon} 
                />
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.optionText,
                    isDark && styles.optionTextDark
                  ]}>
                    {materia.nombre}
                  </Text>
                  <View style={styles.optionSubtextContainer}>
                    <Text style={[
                      styles.optionSubtext,
                      isDark && styles.optionSubtextDark
                    ]}>
                      Semestre {materia.semestre_numero}
                    </Text>
                    <Text style={[
                      styles.optionSubtext,
                      isDark && styles.optionSubtextDark,
                      styles.optionSubtextRight
                    ]}>
                      {materia.carrera_nombre}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#592644',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 20,
    paddingTop: 50,
    paddingBottom: 30,
    height: 300,
  },
  formContainer: {
    marginTop: 280,
    alignItems: 'center',
    paddingHorizontal: 30,
    zIndex: 1,
  },
  formContainerDark: {
    backgroundColor: '#1a1a1a',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  titulo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#34434D',
  },
  tituloDark: {
    color: '#fff',
  },
  titulo2: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#34434D',
  },
  titulo2Dark: {
    color: '#fff',
  },
  titulo3: {
    fontSize: 18,
    color: '#888',
  },
  titulo3Dark: {
    color: '#aaa',
  },
  formSection: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34434D',
    marginBottom: 15,
  },
  sectionTitleDark: {
    color: '#fff',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 18,
    paddingHorizontal: 15,
    marginVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  inputWrapperDark: {
    backgroundColor: '#2d2d2d',
    borderColor: '#444',
  },
  inputIcon: {
    marginRight: 10,
  },
  inputText: {
    flex: 1,
    height: 50,
    color: '#333',
    fontSize: 16,
  },
  inputTextDark: {
    color: '#fff',
  },
  placeholderText: {
    color: '#999',
  },
  registerButton: {
    backgroundColor: '#592644',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 30,
    marginBottom: 20,
    elevation: 6,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  logo: {
    width: 350,
    height: 130,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
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
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
  },
  optionItemDark: {
    backgroundColor: '#3d3d3d',
  },
  optionItemSelected: {
    backgroundColor: '#592644',
  },
  optionIcon: {
    marginRight: 10,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextDark: {
    color: '#fff',
  },
  optionSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  optionSubtextDark: {
    color: '#aaa',
  },
  optionSubtextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  optionSubtextRight: {
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  inputTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  inputSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  inputSubtextDark: {
    color: '#aaa',
  },
}); 