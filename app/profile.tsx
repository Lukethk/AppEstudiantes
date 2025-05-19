import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SessionContext } from '../context/SessionContext';
import { ThemeContext } from '../context/ThemeContext';

export default function ProfileScreen() {
  const { user } = useContext(SessionContext);
  const { isDark } = useContext(ThemeContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    correo: user?.correo || '',
    telefono: '',
    facultad: '',
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <View style={styles.backButtonContent}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
            <Text style={styles.backButtonText}>Volver</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={[styles.content, isDark && styles.contentDark]}>
        <View style={[styles.profileSection, isDark && styles.profileSectionDark]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {formData.nombre.charAt(0).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Ionicons 
                name={isEditing ? "close" : "pencil"} 
                size={20} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDark && styles.labelDark]}>Nombre</Text>
              <TextInput
                style={[
                  styles.input,
                  !isEditing && styles.inputDisabled,
                  isDark && styles.inputDark,
                  isDark && !isEditing && styles.inputDisabledDark
                ]}
                value={formData.nombre}
                onChangeText={(text) => setFormData({...formData, nombre: text})}
                editable={isEditing}
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDark && styles.labelDark]}>Correo</Text>
              <TextInput
                style={[
                  styles.input,
                  !isEditing && styles.inputDisabled,
                  isDark && styles.inputDark,
                  isDark && !isEditing && styles.inputDisabledDark
                ]}
                value={formData.correo}
                onChangeText={(text) => setFormData({...formData, correo: text})}
                editable={isEditing}
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDark && styles.labelDark]}>Teléfono</Text>
              <TextInput
                style={[
                  styles.input,
                  !isEditing && styles.inputDisabled,
                  isDark && styles.inputDark,
                  isDark && !isEditing && styles.inputDisabledDark
                ]}
                value={formData.telefono}
                onChangeText={(text) => setFormData({...formData, telefono: text})}
                editable={isEditing}
                keyboardType="phone-pad"
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDark && styles.labelDark]}>Facultad</Text>
              <TextInput
                style={[
                  styles.input,
                  !isEditing && styles.inputDisabled,
                  isDark && styles.inputDark,
                  isDark && !isEditing && styles.inputDisabledDark
                ]}
                value={formData.facultad}
                onChangeText={(text) => setFormData({...formData, facultad: text})}
                editable={isEditing}
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
            </View>

            {isEditing && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    borderRadius: 8,
    backgroundColor: '#ffffff20',
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 80,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentDark: {
    backgroundColor: '#1a1a1a',
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileSectionDark: {
    backgroundColor: '#2d2d2d',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#592644',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  editButton: {
    position: 'absolute',
    right: '30%',
    bottom: 0,
    backgroundColor: '#592644',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  form: {
    gap: 20,
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
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#eee',
  },
  inputDisabledDark: {
    backgroundColor: '#222',
    borderColor: '#333',
  },
  saveButton: {
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
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
}); 