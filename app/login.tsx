import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Keyboard,
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
import { useTheme } from '../context/ThemeContext';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const expandAnim = useRef(new Animated.Value(305)).current;
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const { login } = useContext(SessionContext);
  const { isDark } = useTheme();

  const handleLogin = async () => {
    if (!correo || !contrasena) {
      return Alert.alert('Error', 'Por favor completa todos los campos.');
    }

    const fakeUser = { nombre: 'Usuario Demo', correo };
    login(fakeUser);

    Animated.timing(expandAnim, {
      toValue: height,
      duration: 600,
      useNativeDriver: false,
    }).start(() => {
      router.replace('/(tabs)');
    });
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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.header}>
          <Image 
            source={require('../assets/images/logo-2.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={[styles.formContainer, isDark && styles.formContainerDark]}>
          <Text style={[styles.titulo, isDark && styles.tituloDark]}>Laboratorios</Text>
          <Text style={[styles.titulo2, isDark && styles.titulo2Dark]}>Univalle</Text>
          <Text style={[styles.titulo3, isDark && styles.titulo3Dark]}>Iniciar Sesión</Text>

          <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
            <MaterialIcons name="email" size={24} color={isDark ? '#aaa' : '#999'} style={styles.inputIcon} />
            <TextInput
              style={[styles.inputText, isDark && styles.inputTextDark]}
              placeholder="example@univalle.edu"
              keyboardType="email-address"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={correo}
              onChangeText={setCorreo}
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.inputWrapper, isDark && styles.inputWrapperDark]}>
            <MaterialIcons name="lock" size={24} color={isDark ? '#aaa' : '#999'} style={styles.inputIcon} />
            <TextInput
              style={[styles.inputText, isDark && styles.inputTextDark]}
              placeholder="contraseña"
              secureTextEntry
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={contrasena}
              onChangeText={setContrasena}
            />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>INICIAR SESIÓN</Text>
          </TouchableOpacity>
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
    paddingTop: 70,
    paddingBottom: 50,
    height: 350,
  },
  formContainer: {
    marginTop: 380,
    alignItems: 'center',
    paddingHorizontal: 30,
    zIndex: 1,
  },
  formContainerDark: {
    backgroundColor: '#1a1a1a',
  },
  titulo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#34434D',
    marginTop: 20,
  },
  tituloDark: {
    color: '#fff',
  },
  titulo2: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#34434D',
  },
  titulo2Dark: {
    color: '#fff',
  },
  titulo3: {
    fontSize: 18,
    marginBottom: 20,
    color: '#888',
  },
  titulo3Dark: {
    color: '#aaa',
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
  loginButton: {
    backgroundColor: '#592644',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 30,
    elevation: 6,
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  logo: {
    width: 350,
    height: 130,
  },
}); 