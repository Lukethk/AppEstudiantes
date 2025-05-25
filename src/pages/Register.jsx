import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    TextField,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    facultad: '',
    id_carrera: '',
    id_materia: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

      // Registro exitoso
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Registro de Estudiante
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Correo Electrónico"
            name="correo"
            type="email"
            value={formData.correo}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Contraseña"
            name="contrasena"
            type="password"
            value={formData.contrasena}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Facultad"
            name="facultad"
            value={formData.facultad}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="ID Carrera"
            name="id_carrera"
            type="number"
            value={formData.id_carrera}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="ID Materia"
            name="id_materia"
            type="number"
            value={formData.id_materia}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Registrarse'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Register; 