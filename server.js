require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    uri: "mysql://root:BuySQMpRepwHbAchHUivprjIFkhKVPSI@mysql.railway.internal:3306/railway",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.get('/', (req, res) => {
    res.send('🚀 Backend de Full Fan Systems sincronizado con la tabla dispositivos.');
});

// ENDPOINT ACTUALIZADO PARA TU TABLA REAL
app.get('/api/check-device/:deviceId', async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        // Ajustado a tus nombres: tabla 'dispositivos' y columna 'codigo_activacion'
        const [rows] = await pool.query('SELECT * FROM dispositivos WHERE codigo_activacion = ?', [deviceId]);

        if (rows.length > 0) {
            const device = rows[0];
            // Ajustado a 'estado' y 'active'
            if (device.estado === 'active') {
                return res.json({
                    authorized: true,
                    username: device.usuario_iptv, // Ajustado a 'usuario_iptv'
                    password: device.password_iptv, // Ajustado a 'password_iptv'
                    status: device.estado
                });
            } else {
                return res.json({ 
                    authorized: false, 
                    message: `El dispositivo está: ${device.estado}` 
                });
            }
        } else {
            // Si no existe, lo insertamos con tus nombres de columna
            await pool.query('INSERT INTO dispositivos (codigo_activacion, estado, nombre_cliente) VALUES (?, ?, ?)', 
            [deviceId, 'pending', 'Nuevo Cliente']);
            
            return res.json({ 
                authorized: false, 
                message: 'Código registrado como pendiente. Actívalo en Railway.' 
            });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error interno', detalle: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor funcionando en puerto ${PORT}`);
});