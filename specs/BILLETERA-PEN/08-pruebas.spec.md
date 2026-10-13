# SPEC 08 — PRUEBAS | BILLETERA PEN

## 1. Pruebas funcionales mínimas

### T01 — Crear billetera

Enviar un `usuario_id` de prueba.

Resultado: `201`, moneda `PEN`, saldo `0.00`, estado `ACTIVA` y referencia `usuario_id` asociada. No crear usuario local.

### T02 — Consultar billetera

Consultar la billetera creada.

Resultado: `200` y campos de billetera definidos en `06-api.spec.md`.

### T03 — Consultar saldo

Consultar el saldo de la billetera recién creada.

Resultado: `200`, moneda `PEN`, saldo `0.00`.

### T04 — Activar billetera

Activar una billetera existente.

Resultado: `200` y estado `ACTIVA`.

### T05 — Inactivar billetera

Inactivar una billetera existente.

Resultado: `200` y estado `INACTIVA`.

### T06 — Validar referencia externa

Crear una billetera con un `usuario_id` de prueba acordado localmente.

Resultado: la billetera conserva ese identificador. No se crea ni consulta un usuario local o remoto.

### T07 — Billetera inexistente

Consultar y cambiar el estado de una billetera inexistente.

Resultado: `404`.

### T08 — No existe tabla `usuarios`

Inspeccionar la base de datos de Billetera.

Resultado: no existe la tabla `usuarios`.

### T09 — No existen endpoints de usuarios

Solicitar una ruta de Usuarios.

Resultado: no hay endpoint `/api/usuarios` ni CRUD de usuarios.

### T10 — No existen endpoints de depósitos

Solicitar rutas de depósitos.

Resultado: no se exponen endpoints de Depósitos.

### T11 — No existen endpoints de retiros

Solicitar rutas de retiros.

Resultado: no se exponen endpoints de Retiros.

### T12 — API REST responde correctamente

Ejecutar las operaciones definidas en `06-api.spec.md`.

Resultado: respuestas JSON y códigos HTTP acordes al SPEC.

## 2. Criterio de aceptación

El proyecto es correcto cuando:

- Frontend y backend inician y el backend conecta con PostgreSQL.
- Crear, consultar, activar e inactivar billeteras funciona.
- La moneda es PEN, saldo inicial `0.00`, estado inicial `ACTIVA`.
- Los errores devuelven códigos HTTP adecuados.
- `usuario_id` funciona como referencia externa sin FK local.
- No existen tablas ni endpoints de Usuarios, Depósitos o Retiros.
- No existen funcionalidades de depósitos, retiros, transferencias o movimientos en Billetera.
- No se agrega funcionalidad fuera de este alcance.

## 3. Aislamiento de servicios

Las pruebas son locales y no requieren Microservicios de Usuarios, Depósitos o Retiros. No crear pruebas de integración externa hasta que los equipos definan sus contratos.

## 4. Extensi�n de movimientos (SPEC 09)

Los criterios sobre saldos y movimientos de SPEC 09 reemplazan el criterio previo que exclu�a esas funciones. Pruebas internas controladas deben cubrir transacci�n, validaci�n, autorizaci�n, historial, idempotencia y concurrencia; las pruebas reales de contrato con Dep�sitos/Retiros siguen pendientes de los acuerdos inter-equipo.
