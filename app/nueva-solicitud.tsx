import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const { height } = Dimensions.get('window');
const NAVBAR_HEIGHT = 130;

export default function NuevaSolicitudScreen() {
  const [titulo, setTitulo] = useState('');
  const [laboratorio, setLaboratorio] = useState('');
  const [numEstudiantes, setNumEstudiantes] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  
  const handleSubmit = () => {
    // Aquí iría la lógica para enviar la solicitud al backend
    
    // Animación del check
    checkScale.value = withSpring(1, { damping: 8 });
    checkOpacity.value = withTiming(1, { duration: 300 });
    
    // Redirección después de 1.5 segundos
    setTimeout(() => {
      router.replace('/');
    }, 1500);
  };

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

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
        <Text style={styles.headerTitle}>Nueva Solicitud</Text>
      </View>

      <ScrollView style={[styles.content, isDark && styles.contentDark]}>
        <View style={[styles.form, isDark && styles.formDark]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Título de la Práctica
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ej: Práctica de Laboratorio de Química"
              placeholderTextColor={isDark ? '#666' : '#999'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Laboratorio
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={laboratorio}
              onChangeText={setLaboratorio}
              placeholder="Ej: Laboratorio de Química"
              placeholderTextColor={isDark ? '#666' : '#999'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Número de Estudiantes
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={numEstudiantes}
              onChangeText={setNumEstudiantes}
              placeholder="Ej: 25"
              keyboardType="numeric"
              placeholderTextColor={isDark ? '#666' : '#999'}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Descripción
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, isDark && styles.inputDark]}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Describe los detalles de la práctica..."
              placeholderTextColor={isDark ? '#666' : '#999'}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>ENVIAR SOLICITUD</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Animated.View 
        style={[styles.successOverlay, checkAnimatedStyle]} 
        pointerEvents="none"
      >
        <View style={styles.checkCircle}>
          <MaterialIcons name="check" size={48} color="#fff" />
        </View>
      </Animated.View>
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
  header: {
    backgroundColor: '#592644',
    height: NAVBAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
    backgroundColor: '#ffffff20',
    borderRadius: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentDark: {
    backgroundColor: '#1a1a1a',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formDark: {
    backgroundColor: '#2d2d2d',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  labelDark: {
    color: '#aaa',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  inputDark: {
    backgroundColor: '#2d2d2d',
    borderColor: '#444',
    color: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#592644',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(89, 38, 68, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 