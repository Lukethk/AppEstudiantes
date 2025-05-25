import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Grid,
    TextField,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NuevaSolicitud = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    id_materia: '',
    fecha_hora_inicio: '',
    fecha_hora_fin: '',
    observaciones: '',
    insumos: [{ id_insumo: '', cantidad_solicitada: '' }]
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleInsumoChange = (index, field, value) => {
    const newInsumos = [...formData.insumos];
    newInsumos[index] = {
      ...newInsumos[index],
      [field]: value
    };
    setFormData({
      ...formData,
      insumos: newInsumos
    });
  };

  const addInsumo = () => {
    setFormData({
      ...formData,
      insumos: [...formData.insumos, { id_insumo: '', cantidad_solicitada: '' }]
    });
  };

  const removeInsumo = (index) => {
    const newInsumos = formData.insumos.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      insumos: newInsumos
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://universidad-la9h.onrender.com/estudiantes/solicitudes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear la solicitud');
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Nueva Solicitud de Materiales
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="ID Materia"
                name="id_materia"
                type="number"
                value={formData.id_materia}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Fecha y Hora de Inicio"
                name="fecha_hora_inicio"
                type="datetime-local"
                value={formData.fecha_hora_inicio}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha y Hora de Fin"
                name="fecha_hora_fin"
                type="datetime-local"
                value={formData.fecha_hora_fin}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                name="observaciones"
                multiline
                rows={4}
                value={formData.observaciones}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Insumos
              </Typography>
              {formData.insumos.map((insumo, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    required
                    label="ID Insumo"
                    type="number"
                    value={insumo.id_insumo}
                    onChange={(e) => handleInsumoChange(index, 'id_insumo', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    required
                    label="Cantidad"
                    type="number"
                    value={insumo.cantidad_solicitada}
                    onChange={(e) => handleInsumoChange(index, 'cantidad_solicitada', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeInsumo(index)}
                    disabled={formData.insumos.length === 1}
                  >
                    Eliminar
                  </Button>
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={addInsumo}
                sx={{ mb: 3 }}
              >
                Agregar Insumo
              </Button>
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Crear Solicitud'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NuevaSolicitud; 