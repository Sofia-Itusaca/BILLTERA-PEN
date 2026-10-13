# SPEC 02 — REQUISITOS | BILLETERA PEN

## 1. Requisitos funcionales

### RF01 — Crear billetera

Crear una billetera asociada a un `usuario_id` externo obligatorio. La moneda se asigna como `PEN`, el saldo inicial es `0.00` y el estado inicial es `ACTIVA`. Este servicio no crea ni valida usuarios mediante otro servicio.

### RF02 — Consultar billetera

Consultar por identificador y devolver como mínimo `id`, `usuario_id`, `moneda`, `saldo`, `estado`, `created_at` y `updated_at`.

### RF03 — Consultar saldo

Consultar el saldo y la moneda de una billetera.

### RF04 — Activar billetera

Cambiar el estado de una billetera existente a `ACTIVA`.

### RF05 — Inactivar billetera

Cambiar el estado de una billetera existente a `INACTIVA`.

## 2. Requisitos sobre microservicios externos

Billetera no administra Usuarios, Depósitos ni Retiros. No crear sus tablas, rutas, controladores, servicios o repositorios. `usuario_id` es una referencia externa sin FK local.

Los contratos futuros para que Depósitos o Retiros afecten el saldo no están definidos. No se agregan endpoints ni integraciones para ese propósito hasta que los equipos acuerden el contrato.

## 3. Requisitos no funcionales

RNF01: el backend expone una API REST y devuelve JSON.

RNF02: los errores devuelven códigos HTTP apropiados.

RNF03: el frontend no accede directamente a PostgreSQL.

RNF04: toda modificación de billetera pasa por el backend.

RNF05: el saldo utiliza precisión decimal; floats de JavaScript no son fuente de verdad.

RNF06: las consultas SQL utilizan parámetros.

## 4. Reglas de negocio

RB01: la moneda permitida es exclusivamente `PEN`.

RB02: una billetera nueva inicia con saldo `0.00` y estado `ACTIVA`.

RB03: `usuario_id` es obligatorio y externo; Billetera no administra ni valida la entidad usuario.

RB04: el estado solo puede ser `ACTIVA` o `INACTIVA`.

RB05: activar una billetera existente establece `ACTIVA`; inactivarla establece `INACTIVA`.

RB06: una billetera inexistente devuelve `404`.

RB07: Billetera no implementa operaciones de depósito, retiro, transferencia ni movimientos.

RB08: no existe eliminación física o endpoint de eliminación definido en este alcance.

## 5. Estados

Estados de billetera:

- `ACTIVA`
- `INACTIVA`

## 6. Requisitos de movimientos (SPEC 09)

La exclusi�n previa de movimientos queda reemplazada: se aplican movimientos confirmados solo desde fuentes autorizadas, actualizando saldo e historial at�micamente; la misma referencia no puede aplicar dos veces. Las validaciones y endpoints se especifican en `09-movimientos.spec.md`.
