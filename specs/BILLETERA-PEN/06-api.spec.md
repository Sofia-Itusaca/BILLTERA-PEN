# SPEC 06 — API | BILLETERA PEN

## Base URL

```text
/api
```

Todas las respuestas usan JSON. No se definen endpoints para Usuarios, Depósitos o Retiros.

## 1. Crear billetera

```http
POST /api/billeteras
Content-Type: application/json
```

Request:

```json
{
  "usuario_id": 1
}
```

`usuario_id` es una referencia externa. No se consulta el Microservicio de Usuarios porque su contrato no está definido. `moneda`, `saldo` y `estado` se asignan como `PEN`, `0.00` y `ACTIVA`.

Respuesta `201`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "usuario_id": 1,
    "moneda": "PEN",
    "saldo": "0.00",
    "estado": "ACTIVA",
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-01-01T00:00:00.000Z"
  }
}
```

`400` si falta `usuario_id` o no es válido.

## 2. Consultar billetera

```http
GET /api/billeteras/:id
```

Respuesta `200`: objeto de billetera con `id`, `usuario_id`, `moneda`, `saldo`, `estado`, `created_at` y `updated_at` dentro de `data`.

`404` si no existe.

## 3. Consultar saldo

```http
GET /api/billeteras/:id/saldo
```

Respuesta `200`:

```json
{
  "success": true,
  "data": {
    "billetera_id": 1,
    "moneda": "PEN",
    "saldo": "0.00"
  }
}
```

`404` si no existe.

## 4. Activar billetera

```http
PATCH /api/billeteras/:id/activar
```

Establece el estado en `ACTIVA` y devuelve la billetera actualizada dentro de `data` con `200`. Devuelve `404` si no existe.

## 5. Inactivar billetera

```http
PATCH /api/billeteras/:id/inactivar
```

Establece el estado en `INACTIVA` y devuelve la billetera actualizada dentro de `data` con `200`. Devuelve `404` si no existe.

## 6. Errores

```json
{
  "success": false,
  "message": "Descripción del error"
}
```

## 7. Endpoints no definidos en este alcance

No crear rutas para:

- `/api/usuarios`.
- Depósitos o retiros.
- Transferencias o movimientos.
- Escritura de saldo para integraciones externas.

La forma de comunicar cambios de saldo solicitados por Depósitos o Retiros queda pendiente de un acuerdo entre los equipos; este SPEC no inventa ese contrato.

## 8. Endpoints de movimientos (SPEC 09)

Aplicaci�n e historial se definen en SPEC 09. Aplicar requiere autenticaci�n de servicio y el body no contiene `servicio_origen` ni saldos; el backend los deriva/calcula. Historial acepta `tipo`, `direccion`, `desde`, `hasta`, `pagina`, `limite`. No hay endpoint p�blico para borrar movimientos.
