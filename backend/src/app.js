const express = require('express');
const cors = require('cors');
const billeteraRoutes = require('./routes/billetera.routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/billeteras', billeteraRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
