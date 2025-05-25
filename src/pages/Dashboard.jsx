import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchSolicitudes();
  }, [navigate]);

  const fetchSolicitudes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://universidad-la9h.onrender.com/estudiantes/solicitudes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar las solicitudes');
      }

      const data = await response.json();
      setSolicitudes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaSolicitud = () => {
    navigate('/nueva-solicitud');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Mis Solicitudes
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNuevaSolicitud}
        >
          Nueva Solicitud
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Materia</TableCell>
              <TableCell>Fecha Inicio</TableCell>
              <TableCell>Fecha Fin</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {solicitudes.map((solicitud) => (
              <TableRow key={solicitud.id_solicitud}>
                <TableCell>{solicitud.id_solicitud}</TableCell>
                <TableCell>{solicitud.materia_nombre}</TableCell>
                <TableCell>{new Date(solicitud.fecha_hora_inicio).toLocaleString()}</TableCell>
                <TableCell>
                  {solicitud.fecha_hora_fin
                    ? new Date(solicitud.fecha_hora_fin).toLocaleString()
                    : 'No especificada'}
                </TableCell>
                <TableCell>{solicitud.estado}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/solicitudes/${solicitud.id_solicitud}`)}
                  >
                    Ver Detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Dashboard; 