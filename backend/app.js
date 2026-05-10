const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth.routes');

app.use('/api/auth', authRoutes);

//este puerto no se cambia, no es del server
app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});