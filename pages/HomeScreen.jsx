import { Ionicons } from '@expo/vector-icons';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { height } = Dimensions.get('window');
const NAVBAR_HEIGHT = 130;

export default function HomeScreen() {
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

  const filtro = 'pendiente';
  const solicitudesFiltradas = solicitudes.filter(s => s.estado === filtro);

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.logoContainer} />
        <View style={styles.navbar}>
          <Ionicons name="home-outline" size={30} color="white" style={{ marginTop: 50 }} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.text}>Solicitudes</Text>

        <View style={styles.filtroContainer}>
          {['pendiente', 'aprobada', 'rechazada'].map(estado => (
            <TouchableOpacity key={estado} style={[styles.filtroButton, filtro === estado && styles.filtroButtonActivo]}>
              <Text style={[styles.filtroButtonText, filtro === estado && styles.filtroButtonTextActivo]}>
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={{ marginTop: 20, width: '100%', maxHeight: '60%' }}>
          {solicitudesFiltradas.map(s => {
            let estadoColor = '#ccc';
            if (s.estado === 'pendiente') estadoColor = '#f5a623';
            if (s.estado === 'aprobada') estadoColor = '#4caf50';
            if (s.estado === 'rechazada') estadoColor = '#e53935';

            return (
              <View key={s.id_solicitud} style={[styles.card, { borderLeftColor: estadoColor }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{s.practica_titulo}</Text>
                  <View style={[styles.badge, { backgroundColor: estadoColor }]}>
                    <Text style={styles.badgeText}>{s.estado}</Text>
                  </View>
                </View>
                <Text style={styles.cardText}>Estudiantes: {s.numero_estudiantes}</Text>
                <Text style={styles.cardText}>Laboratorio: {s.laboratorio_nombre}</Text>
                <Text style={styles.cardText}>Fecha: {new Date(s.fecha_solicitud).toLocaleString()}</Text>
              </View>
            );
          })}
        </ScrollView>

        <TouchableOpacity style={styles.solicitudButton}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.solicitudButtonText}>Crear nueva solicitud</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: height,
    backgroundColor: '#592644',
    zIndex: 10,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  logoContainer: {
    position: 'absolute',
    top: 80,
    width: '100%',
    alignItems: 'center',
    zIndex: 11,
  },
  navbar: {
    position: 'absolute',
    bottom: 0,
    height: NAVBAR_HEIGHT,
    width: '100%',
    backgroundColor: '#592644',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  content: {
    zIndex: 1,
    paddingHorizontal: 20,
    paddingTop: 90,
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#592644',
    textAlign: 'center',
    marginBottom: 10,
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
  filtroButtonActivo: {
    backgroundColor: '#592644',
  },
  filtroButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  filtroButtonTextActivo: {
    color: 'white',
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
  cardText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
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
});
