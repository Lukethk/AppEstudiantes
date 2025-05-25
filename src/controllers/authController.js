import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from 'mssql';
import { getConnection } from "../database/connection.js";

export const loginEstudiante = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({
                message: "Correo y contraseña son requeridos"
            });
        }

        const pool = await getConnection();

        const estudiante = await pool.request()
            .input('correo', sql.VarChar(100), correo)
            .query(`
                SELECT id_estudiante, nombre, correo, contrasena
                FROM Estudiantes
                WHERE correo = @correo
            `);

        if (estudiante.recordset.length === 0) {
            return res.status(401).json({
                message: "Credenciales inválidas"
            });
        }

        const estudianteData = estudiante.recordset[0];
        const contrasenaValida = await bcrypt.compare(contrasena, estudianteData.contrasena);

        if (!contrasenaValida) {
            return res.status(401).json({
                message: "Credenciales inválidas"
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                id: estudianteData.id_estudiante,
                correo: estudianteData.correo
            },
            process.env.JWT_SECRET || 'tu_clave_secreta',
            { expiresIn: '24h' }
        );

        res.json({
            nombre: estudianteData.nombre,
            correo: estudianteData.correo,
            token
        });

    } catch (error) {
        console.error('Error en loginEstudiante:', error);
        res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
}; 