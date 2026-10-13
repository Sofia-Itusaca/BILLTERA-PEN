# Billetera PEN

Microservicio de billeteras en PEN: React/Vite, Node/Express y PostgreSQL. Usuarios, Depósitos y Retiros siguen siendo servicios de otros equipos; este repositorio no mantiene usuarios ni implementa sus procesos internos.

## API

Además de crear/consultar billeteras, consultar saldo y cambiar estado:

| Método | Ruta | Uso |
| --- | --- | --- |
| POST | `/api/billeteras/:id/movimientos` | Aplicar movimiento confirmado. Requiere `x-service-name` y `x-service-token` válidos para DEPOSITOS o RETIROS. |
| GET | `/api/billeteras/:id/movimientos` | Historial con filtros `tipo`, `direccion`, `desde`, `hasta`, `pagina`, `limite` (máximo 100). |

El POST deriva `servicio_origen` de la identidad autenticada, calcula saldos en PostgreSQL y devuelve `201` al aplicar o `200` para reintento idéntico. Una referencia incompatible devuelve `409`.

## Desarrollo local

Configura `DATABASE_URL` en `backend/.env`. Define por canal seguro `DEPOSITOS_SERVICE_TOKEN` y `RETIROS_SERVICE_TOKEN`; no hay valores predeterminados ni credenciales en el repositorio. Sin esos valores las escrituras de movimientos se rechazan. Las lecturas de historial son públicas como las consultas de billetera existentes.

Inicializa tablas ejecutando el esquema base y luego la migración aditiva `backend/database/migrations/001_create_movimientos.sql` sobre la misma base. No elimina ni recrea `billeteras`.

```powershell
cd backend
npm install
npm start
```

En otra terminal:

```powershell
cd frontend
npm install
npm run dev
```

El endpoint implementa la parte de Billetera. La integración real con Depósitos/Retiros queda pendiente de acordar contrato HTTP, esquema de autorización/intercambio de secretos, identificador global, dirección pública/privada y momento de confirmación/reintentos. No se afirma integración real con esos servicios ni con Yape, Plin o bancos.

La descripción completa está en `specs/09-movimientos.spec.md` y los SPEC relacionados actualizados.
