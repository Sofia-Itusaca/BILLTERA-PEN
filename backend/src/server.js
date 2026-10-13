require('dotenv').config();
const app = require('./app');
const db = require('./config/database');

const port = Number(process.env.PORT || 3000);

db.query('SELECT 1')
  .then(() => {
    app.listen(port, () => console.log(`Billetera PEN API disponible en puerto ${port}`));
  })
  .catch((error) => {
    console.error('No se pudo conectar a PostgreSQL. Revisa DATABASE_URL.', error.message);
    process.exit(1);
  });
