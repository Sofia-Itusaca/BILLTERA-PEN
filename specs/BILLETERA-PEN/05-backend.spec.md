# SPEC 05 — BACKEND | BILLETERA PEN

## 1. Tecnología obligatoria

- Node.js
- Express
- PostgreSQL
- `pg`
- `dotenv`
- `cors`

No incorporar frameworks adicionales.

## 2. Puerto y configuración

Puerto predeterminado:

```env
PORT=3000
DATABASE_URL=postgresql://usuario:password@localhost:5432/billetera_pen
```

El puerto se puede cambiar mediante `.env`. No agregar variables de servicios externos mientras sus contratos no estén definidos.

## 3. Responsabilidades por capa

### Controller

- Recibir requests.
- Validar presencia y formato básico de datos.
- Llamar al service.
- Responder con HTTP y JSON.

### Service

- Aplicar las reglas de negocio propias de billeteras.
- Coordinar la creación, consulta y cambios de estado.
- No implementar depósitos, retiros, transferencias o cambios de saldo solicitados mediante contratos externos no definidos.

### Repository

- Ejecutar consultas parametrizadas de PostgreSQL para `billeteras`.
- No contener reglas de negocio.

## 4. Endpoints de Billetera

```text
POST   /api/billeteras
GET    /api/billeteras/:id
GET    /api/billeteras/:id/saldo
PATCH  /api/billeteras/:id/activar
PATCH  /api/billeteras/:id/inactivar
```

No exponer endpoints adicionales sin documentarlos y acordarlos primero en los SPEC.

## 5. Responsabilidades excluidas

No implementar rutas, controladores, servicios, repositorios o modelos para:

- Usuarios (`/api/usuarios`).
- Depósitos.
- Retiros.
- Transferencias o movimientos.

El backend solo almacena `usuario_id` como referencia externa y no integra servicios externos hasta que exista un contrato acordado.

## 6. Respuestas

Éxito:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Descripción del error"
}
```

## 7. Códigos HTTP

- `200`: consulta o actualización exitosa.
- `201`: billetera creada.
- `400`: datos inválidos.
- `404`: billetera inexistente o ruta no definida.
- `500`: error interno.

## 8. Reglas obligatorias

- El saldo nunca se modifica desde el controller.
- El frontend nunca accede directamente a PostgreSQL.
- No colocar SQL dentro de routes o controllers.
- No aceptar monedas diferentes de `PEN`.
- No crear usuarios ni implementar lógica de depósitos o retiros.
- No guardar secretos en el código.

## 9. Extensi�n de movimientos (SPEC 09)

Se a�aden repositorio/servicio/controlador/rutas de movimientos bajo la estructura por capas. El registro usa transacci�n PostgreSQL y bloqueo `FOR UPDATE`; `servicio_origen` se deriva de `x-service-name` tras validar `x-service-token` contra secretos `DEPOSITOS_SERVICE_TOKEN`/`RETIROS_SERVICE_TOKEN`. Sin secreto configurado se rechaza la escritura.
