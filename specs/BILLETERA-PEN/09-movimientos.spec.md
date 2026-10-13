# SPEC 09 — Historial e Integración de Movimientos de Billetera PEN

**Proyecto:** Billetera PEN  
**Versión:** 1.1  
**Estado:** Pendiente de implementación y validación

## 1. Objetivo

Implementar el historial de movimientos y definir cómo se actualiza el saldo cuando otro microservicio confirma una operación.

**Regla central:** cuando Depósitos o Retiros confirmen una operación que afecta una billetera, deben enviar la operación a Billetera. Billetera valida la solicitud y, en una única transacción de PostgreSQL, actualiza el saldo y registra el movimiento. El usuario no registra manualmente cada movimiento desde el frontend.

Billetera no detecta por sí sola operaciones que ocurren en otros servicios o plataformas: necesita recibir una solicitud autorizada de un servicio integrado.

## 2. Alcance

- Registrar ingresos y egresos confirmados.
- Recibir operaciones de los microservicios de Depósitos y Retiros.
- Actualizar saldo y registrar el movimiento atómicamente.
- Consultar y filtrar el historial.
- Registrar tipo, origen, servicio de origen, referencia, importe, fecha, descripción y saldos anterior/posterior.
- Evitar procesar dos veces la misma operación.
- Mostrar el historial en el frontend React/Vite.

## 3. Tipos de movimiento

| Tipo | Dirección habitual | Ejemplo |
|---|---|---|
| `DEPOSITO` | `INGRESO` | Depósito confirmado |
| `RETIRO` | `EGRESO` | Retiro confirmado |
| `TRANSFERENCIA` | Ingreso o egreso | Transferencia |
| `PAGO_SUSCRIPCION` | `EGRESO` | Suscripción cobrada |
| `COMISION_BANCARIA` | `EGRESO` | Comisión confirmada |
| `AJUSTE` | Ingreso o egreso | Corrección autorizada |
| `OTRO` | Ingreso o egreso | Otra operación documentada |

La dirección debe indicarse explícitamente como `INGRESO` o `EGRESO`.

## 4. Origen y servicio que reporta

Registrar:
- `origen`: por ejemplo `YAPE`, `PLIN`, `TRANSFERENCIA_BANCARIA`, `CAJERO`, `AGENTE`, `SUSCRIPCION`, `COMISION_BANCARIA`, `INTERNO` u `OTRO`.
- `servicio_origen`: por ejemplo `DEPOSITOS` o `RETIROS`.
- `referencia_externa`: identificador de la operación en el servicio de origen.
- `descripcion`: detalle recibido de la fuente autorizada.

Estos valores no significan que exista integración real con Yape, Plin o bancos. Las operaciones externas solo se aplican cuando una fuente autorizada confirma que ocurrieron.

## 5. Modelo de datos

Crear la tabla `movimientos`, relacionada con `billeteras`.

| Campo | Tipo propuesto | Descripción |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | Identificador |
| `billetera_id` | INTEGER NOT NULL | Referencia a `billeteras.id` |
| `tipo` | VARCHAR(30) NOT NULL | Tipo de operación |
| `direccion` | VARCHAR(10) NOT NULL | `INGRESO` o `EGRESO` |
| `monto` | DECIMAL(15,2) NOT NULL | Importe positivo |
| `origen` | VARCHAR(40) NOT NULL | Canal/procedencia |
| `servicio_origen` | VARCHAR(30) NOT NULL | Servicio que reporta |
| `descripcion` | VARCHAR(255) | Detalle |
| `referencia_externa` | VARCHAR(100) NOT NULL | Referencia única de la operación |
| `saldo_anterior` | DECIMAL(15,2) NOT NULL | Saldo previo |
| `saldo_posterior` | DECIMAL(15,2) NOT NULL | Saldo posterior |
| `created_at` | TIMESTAMP NOT NULL | Fecha/hora de registro |

Reglas:
- `billetera_id` referencia `billeteras.id`.
- `monto > 0`; los saldos no pueden ser negativos.
- Crear índice por `billetera_id` y fecha.
- Crear restricción única sobre (`servicio_origen`, `referencia_externa`) para evitar aplicar la misma operación dos veces.
- No crear tabla local de usuarios.
- Mantener PEN como moneda de la billetera.
- Crear una migración compatible con los datos existentes.

## 6. Flujo obligatorio de integración

### Depósito
1. Depósitos ejecuta su proceso y confirma el depósito según sus propias reglas.
2. Depósitos envía a Billetera una solicitud autorizada con billetera, tipo, dirección, importe, origen y referencia única.
3. Billetera valida la solicitud, la billetera y la referencia.
4. Billetera bloquea la fila de la billetera o utiliza un mecanismo transaccional equivalente.
5. Billetera calcula los saldos en el backend.
6. En una transacción, actualiza `billeteras.saldo` e inserta `movimientos`.
7. Billetera devuelve éxito y el saldo resultante.
8. Depósitos respeta la respuesta y sus reglas de estado/reintento.

### Retiro
1. Retiros valida su operación y solicita a Billetera aplicar el egreso en el momento acordado por ambos equipos.
2. Billetera valida la billetera activa, la referencia y el saldo disponible.
3. Si el saldo es insuficiente, rechaza la operación sin modificar saldo ni crear un movimiento aplicado.
4. Si es válida, actualiza saldo e inserta el movimiento en una única transacción.
5. Retiros no debe considerar aplicado el movimiento si Billetera lo rechaza.

### Reintentos y fallos
- Usar `servicio_origen` + `referencia_externa` para idempotencia.
- Si llega una operación ya aplicada, no volver a cambiar el saldo; devolver una respuesta consistente con el resultado previo.
- Si la respuesta se pierde o Billetera no está disponible, el servicio de origen debe poder reintentar con la misma referencia.
- Probar solicitudes duplicadas, incluso concurrentes.
- No agregar broker, colas ni API Gateway.
- La lógica interna y los estados de Depósitos/Retiros siguen perteneciendo a esos servicios.

## 7. Reglas de negocio

**RN-01.** No aplicar movimientos a billeteras inexistentes o inactivas.

**RN-02.** Ingreso: `saldo_posterior = saldo_anterior + monto`. Egreso: `saldo_posterior = saldo_anterior - monto`.

**RN-03.** No permitir saldos negativos.

**RN-04.** Actualización de saldo e inserción del movimiento deben ocurrir en una sola transacción. Si falla una, revertir ambas.

**RN-05.** Proteger operaciones concurrentes sobre la misma billetera.

**RN-06.** Los movimientos confirmados no se eliminan ni se modifican para representar otra operación. Las correcciones se registran como nuevos movimientos autorizados.

**RN-07.** La misma referencia del mismo servicio no puede afectar el saldo más de una vez.

**RN-08.** El endpoint no puede ser público sin controles. Revisar la seguridad existente y reutilizarla. Si falta autenticación entre servicios, documentar la limitación y proponer el mecanismo mínimo que deben acordar los equipos; no inventar credenciales.

**RN-09.** No aplicar movimientos por operaciones pendientes o no confirmadas.

## 8. API REST

Mantener los endpoints existentes de Billetera.

### Aplicar un movimiento confirmado
`POST /api/billeteras/:id/movimientos`

Ejemplo:

```json
{
  "tipo": "DEPOSITO",
  "direccion": "INGRESO",
  "monto": 150.00,
  "origen": "YAPE",
  "servicio_origen": "DEPOSITOS",
  "referencia_externa": "DEP-12345",
  "descripcion": "Depósito confirmado"
}
```

Reglas:
- Uso exclusivo de fuentes autorizadas, no una operación pública para que el usuario modifique el saldo.
- `billetera_id` procede de la ruta.
- Validar `servicio_origen`; no confiar ciegamente en un texto enviado por cualquier cliente.
- Calcular los saldos en backend; no aceptar `saldo_anterior` ni `saldo_posterior` desde la solicitud.
- Acordar el contrato con los equipos de Depósitos y Retiros.
- No inventar URLs, puertos, tokens ni credenciales de otros servicios.

### Consultar historial
`GET /api/billeteras/:id/movimientos`

Filtros opcionales: `tipo`, `direccion`, `desde`, `hasta`, `pagina`, `limite`.

Ejemplo:
`GET /api/billeteras/1/movimientos?direccion=EGRESO&pagina=1&limite=20`

Ordenar del más reciente al más antiguo y devolver metadatos de paginación.

### Respuestas HTTP
- `200`: consulta correcta o repetición idempotente reconocida.
- `201`: movimiento aplicado por primera vez.
- `400`: datos inválidos.
- `401/403`: fuente no autenticada/no autorizada, según la seguridad existente.
- `404`: billetera inexistente.
- `409`: saldo insuficiente o conflicto de referencia.
- `500`: error interno.

Mantener el formato de respuesta existente y definir/probar la respuesta exacta para reintentos idempotentes.

## 9. Backend

Integrar en Node.js/Express siguiendo la estructura actual:
- rutas, controlador, servicio y repositorio de movimientos;
- consultas SQL parametrizadas;
- transacción para saldo e historial;
- idempotencia, control de concurrencia y validación de fuente autorizada;
- errores consistentes.

No crear otro servidor ni duplicar lógica entre capas.

## 10. Frontend

Mantener React/Vite. Añadir **Historial de movimientos** con fecha/hora, tipo, origen, servicio de origen, descripción, dirección, importe y saldo posterior. Añadir filtros por tipo, dirección y fechas, paginación y estados de carga, vacío y error.

El frontend consulta la API; no accede a PostgreSQL ni es la fuente de verdad del saldo. Tras una operación, refresca los datos desde la respuesta del backend o vuelve a consultar. No ofrecer una pantalla pública para registrar movimientos arbitrarios.

## 11. Límites

No desarrollar CRUD/tabla de usuarios, lógica interna completa de depósitos/retiros, integración real con Yape/Plin/bancos sin contrato real, cobros automáticos de suscripciones, API Gateway, broker ni servicios externos no acordados.

Los equipos deben acordar el contrato HTTP, el identificador de cada operación y el momento en que se considera confirmada. Este SPEC define lo que Billetera debe hacer, pero no afirma que Depósitos/Retiros ya estén implementados o integrados.

## 12. Pruebas obligatorias

1. Ingreso aumenta el saldo y crea un movimiento.
2. Egreso disminuye el saldo y crea un movimiento.
3. Historial ordenado y filtros correctos.
4. Rechazo de monto cero/negativo.
5. Rechazo de billetera inexistente/inactiva.
6. Rechazo de saldo insuficiente.
7. Error de transacción revierte saldo e historial.
8. Repetir una referencia no cambia el saldo por segunda vez.
9. Referencias duplicadas concurrentes se aplican una sola vez.
10. Operaciones diferentes concurrentes conservan el saldo correcto.
11. Rechazo de fuentes no autorizadas según la seguridad implementada.
12. Pruebas de contrato con Depósitos y Retiros cuando sus contratos estén disponibles.
13. Simular indisponibilidad y verificar que el reintento con la misma referencia no duplica la operación.
14. Historial no eliminable mediante endpoints públicos.
15. Frontend probado con lista vacía, movimientos, carga y errores.
16. Ejecutar pruebas backend y compilación frontend.

No declarar exitosas las pruebas reales de integración si los otros servicios/contratos no están disponibles; usar simulaciones y marcar la integración real como pendiente.

## 13. Instrucciones para Codex

Antes de cambiar código:
1. Leer README y todos los SPEC actuales.
2. Inspeccionar backend, frontend, esquema y pruebas.
3. Revisar saldo, activación y seguridad existentes.
4. Identificar los datos/contratos que deben acordarse con Depósitos y Retiros.

Después:
1. Guardar como `specs/BILLETERA-PEN/09-movimientos.spec.md`, adaptando la ruta a la estructura real.
2. Actualizar los SPEC relacionados con base de datos, backend, API, frontend y pruebas.
3. Implementar historial, registro atómico, idempotencia y control de concurrencia.
4. Crear una migración compatible con los datos existentes.
5. No inventar direcciones, puertos, credenciales ni contratos externos.
6. Ejecutar las pruebas disponibles y compilar el frontend.
7. Informar archivos modificados, pruebas ejecutadas, resultados reales y pendientes de integración.

No eliminar funcionalidades existentes válidas. No afirmar que una prueba pasó si no se ejecutó. Si falta un contrato externo indispensable, probar la parte interna de Billetera y documentar exactamente qué integración queda pendiente.

## 14. Implementaci�n actual y acuerdo de integraci�n pendiente

Estado: la implementaci�n local del lado Billetera est� realizada. `POST /api/billeteras/:id/movimientos` solo acepta llamadas autenticadas con `x-service-name: DEPOSITOS|RETIROS` y `x-service-token`; cada nombre se valida contra `DEPOSITOS_SERVICE_TOKEN` o `RETIROS_SERVICE_TOKEN` configurado fuera del repositorio. No se agreg� una pantalla de registro p�blico. La lista de movimientos es consultable por el frontend.

Antes de conectar los microservicios reales, los equipos deben confirmar: (1) URL/base path y red de servicio; (2) nombres/tipos/formato JSON de los campos y si admiten fecha efectiva aportada por el servicio (la implementaci�n ahora usa hora de PostgreSQL); (3) m�todo seguro de autenticaci�n, entrega/rotaci�n de secretos y TLS; (4) cat�logo permitido de `origen`, tipos/direcciones por operaci�n y qui�n reporta ajustes; (5) unicidad/retenci�n/alcance global de la referencia; (6) momento exacto de confirmaci�n del dep�sito y reserva/ejecuci�n del retiro; (7) significado de respuestas 200/201/400/403/404/409 y pol�tica de timeout/reintento. La implementaci�n no llama a los servicios externos y no se ha ejecutado prueba de contrato real.

**Estado de ejecución (2026-10-09):** implementado en Billetera y probado internamente. La integración externa continúa pendiente de contratos y credenciales acordados; no se ejecutaron pruebas con Depósitos/Retiros reales.
