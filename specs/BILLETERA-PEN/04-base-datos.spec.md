# SPEC 04 — BASE DE DATOS | BILLETERA PEN

## 1. Motor y propiedad

El motor es PostgreSQL. La base de datos pertenece exclusivamente al Microservicio de Billetera y contiene únicamente datos propios de billeteras.

No crear tablas locales `usuarios`, `depositos`, `retiros` o `movimientos`.

## 2. Tabla `billeteras`

| Columna | Tipo/regla |
| --- | --- |
| `id` | Clave primaria generada por la base de datos |
| `usuario_id` | Obligatorio; identificador externo, sin FK local |
| `moneda` | Obligatorio; exclusivamente `PEN` |
| `saldo` | `NUMERIC(15,2)`, obligatorio, mínimo `0.00`, por defecto `0.00` |
| `estado` | `ACTIVA` o `INACTIVA`; por defecto `ACTIVA` |
| `created_at` | Fecha de creación |
| `updated_at` | Fecha de última modificación |

## 3. Reglas de integridad

- Crear únicamente claves primarias y restricciones propias de `billeteras`.
- No crear FK hacia Usuarios ni duplicar su tabla.
- No permitir una moneda diferente de `PEN`.
- No permitir saldo negativo.
- `usuario_id` es obligatorio y no se valida mediante un contrato externo todavía inexistente.
- La base no contiene datos ni operaciones de Depósitos o Retiros.

## 4. Saldo e integración futura

La billetera conserva y consulta su saldo. Una nueva billetera inicia en `0.00`.

Los mecanismos por los que Depósitos y Retiros solicitarán cambios de saldo quedan pendientes del acuerdo de integración. No crear tablas de movimientos ni inventar endpoints, formatos o transacciones para esos microservicios en este alcance.

## 5. Datos de prueba

Usar valores `usuario_id` de prueba acordados localmente. No crear una tabla `usuarios` ni datos de usuarios dentro de esta base.

## 6. Movimientos (SPEC 09)

La exclusi�n de `movimientos` queda sustituida por la tabla propia de auditor�a descrita en SPEC 09. Se crea con `backend/database/migrations/001_create_movimientos.sql` de manera aditiva, con FK a billeteras, montos/saldos no negativos, unicidad `(servicio_origen, referencia_externa)` e �ndice `(billetera_id, created_at DESC, id DESC)`. No se modifica ni recrea la tabla existente.
