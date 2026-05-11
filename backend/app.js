const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth.routes');
const dashboardRoutes   = require('./routes/dashboard.routes');
const asistenciasRoutes = require('./routes/asistencias.routes');
const alumnosRoutes = require('./routes/alumnos.routes');
const maestrosRoutes = require('./routes/maestros.routes');
const gruposRoutes = require('./routes/grupos.routes');

app.use('/api/grupos', gruposRoutes);
app.use('/api/maestros', maestrosRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/auth', authRoutes);

//este puerto no se cambia, no es del server
app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});