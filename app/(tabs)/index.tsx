import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const { height } = Dimensions.get('window');
const NAVBAR_HEIGHT = 100;
const EXPANDED_HEIGHT = height * 1.1;

export default function HomeScreen() {
  const [filtro, setFiltro] = useState('pendiente');
  const { isDark, toggleTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleNavbar = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    Animated.spring(animation, {
      toValue,
      useNativeDriver: false,
      tension: 40,
      friction: 7
    }).start();
  };

  // Datos de ejemplo
  const solicitudes = [
    {
      id_solicitud: 1,
      practica_titulo: 'Práctica de Biología',
      estado: 'pendiente',
      numero_estudiantes: 25,
      laboratorio_nombre: 'Lab. Biología',
      fecha_solicitud: new Date().toISOString()
    },
    {
      id_solicitud: 2,
      practica_titulo: 'Práctica de Química',
      estado: 'aprobada',
      numero_estudiantes: 18,
      laboratorio_nombre: 'Lab. Química',
      fecha_solicitud: new Date().toISOString()
    },
  ];

  const handleLogout = () => {
    router.replace('/login');
  };

  const solicitudesFiltradas = solicitudes.filter(s => s.estado.toLowerCase() === filtro.toLowerCase());

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.content}>
        <View style={styles.developmentContainer}>
          <Icon name="code-braces" size={60} color="#592644" />
          <Text style={[styles.developmentTitle, isDark && styles.developmentTitleDark]}>
            Aplicación en Desarrollo
          </Text>
          <Text style={[styles.developmentText, isDark && styles.developmentTextDark]}>
            Estamos trabajando para brindarte la mejor experiencia
          </Text>
        </View>
      </View>

      <View style={[styles.header, { zIndex: 1000 }]}>
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={toggleNavbar}
          style={styles.navbarTouchable}
        >
          <Animated.View style={[
            styles.navbar,
            {
              height: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [NAVBAR_HEIGHT, EXPANDED_HEIGHT]
              })
            }
          ]}>
            <View style={styles.navbarTop}>
              <Animated.View style={[
                styles.logoContainer,
                {
                  opacity: animation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.5, 1]
                  }),
                  transform: [{
                    translateY: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0]
                    })
                  }]
                }
              ]}>
                <Image 
                  source={require('../../assets/images/logo-2.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </Animated.View>
              <Animated.View style={[
                styles.arrowContainer,
                {
                  opacity: animation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0.5, 0]
                  }),
                  transform: [{
                    translateY: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -20]
                    })
                  }]
                }
              ]}>
                <Icon 
                  name="chevron-down" 
                  size={30} 
                  color="#fff" 
                />
              </Animated.View>
            </View>

            <Animated.View style={[
              styles.navbarContent,
              {
                opacity: animation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.5, 1]
                }),
                transform: [{
                  translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0]
                  })
                }]
              }
            ]}>
              <View style={styles.navbarButtons}>
                <TouchableOpacity 
                  style={styles.navbarButton}
                  onPress={() => router.push('/profile')}
                >
                  <Icon name="account" size={24} color="#fff" />
                  <Text style={styles.navbarButtonText}>Perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.navbarButton}
                  onPress={toggleTheme}
                >
                  {isDark ? (
                    <>
                      <Icon name="weather-sunny" size={24} color="#fff" />
                      <Text style={styles.navbarButtonText}>Modo Claro</Text>
                    </>
                  ) : (
                    <>
                      <Icon name="weather-night" size={24} color="#fff" />
                      <Text style={styles.navbarButtonText}>Modo Oscuro</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.navbarButton}
                  onPress={handleLogout}
                >
                  <Icon name="logout" size={24} color="#fff" />
                  <Text style={styles.navbarButtonText}>Salir</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.navbarFooter}>
                <TouchableOpacity 
                  style={styles.hideMenuButton}
                  onPress={toggleNavbar}
                >
                  <Icon name="chevron-up" size={24} color="#fff" />
                  <Text style={styles.hideMenuText}>Ocultar menú</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  containerDark: {
    backgroundColor: '#1a1a1a'
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#592644',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  navbarTouchable: {
    width: '100%',
  },
  navbar: {
    width: '100%',
    backgroundColor: '#592644',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  navbarTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    height: NAVBAR_HEIGHT + 40,
    position: 'relative',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 400,
    height: 140,
    marginTop: 5,
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 50,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navbarContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    justifyContent: 'space-between',
  },
  navbarButtons: {
    flexDirection: 'column',
    gap: 20,
    marginTop: 40,
  },
  navbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffffff20',
    borderRadius: 8,
    gap: 15,
  },
  navbarButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: NAVBAR_HEIGHT + 30,
    alignItems: 'center',
  },
  contentDark: {
    backgroundColor: '#1a1a1a',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#592644',
    textAlign: 'center',
    marginBottom: 10,
  },
  textDark: {
    color: '#fff',
  },
  filtroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 35,
    marginBottom: 20,
    width: '100%',
  },
  filtroButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  filtroButtonDark: {
    backgroundColor: '#333',
  },
  filtroButtonActivo: {
    backgroundColor: '#592644',
  },
  filtroButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  filtroButtonTextDark: {
    color: '#fff',
  },
  filtroButtonTextActivo: {
    color: 'white',
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    marginTop: 30,
  },
  noDataDark: {
    color: '#666',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eee',
    borderLeftWidth: 6,
  },
  cardDark: {
    backgroundColor: '#2d2d2d',
    borderColor: '#333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  cardTitleDark: {
    color: '#fff',
  },
  cardText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  cardTextDark: {
    color: '#aaa',
  },
  solicitudButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#592644',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 40,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  solicitudButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    },
  navbarFooter: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  hideMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  hideMenuText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  developmentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  developmentTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#592644',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  developmentTitleDark: {
    color: '#fff',
  },
  developmentText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  developmentTextDark: {
    color: '#aaa',
  },
});
