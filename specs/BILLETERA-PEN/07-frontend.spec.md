# SPEC 07 — FRONTEND | BILLETERA PEN

## 1. Tecnología

- React
- Vite
- JavaScript

No incorporar librerías innecesarias.

## 2. Objetivo

Crear una interfaz sencilla para crear y consultar billeteras, mostrar saldo y estado, y activar o inactivar una billetera.

## 3. Pantallas

### Inicio

Debe mostrar:

- Título Billetera PEN.
- Formulario para crear una billetera con `usuario_id` externo.
- Campo para consultar una billetera por su identificador.
- Mensajes de éxito y error.

El formulario no registra ni administra usuarios.

### Billetera

Debe mostrar:

- Identificador de billetera.
- `usuario_id`.
- Saldo y moneda PEN.
- Estado ACTIVA o INACTIVA.
- Acción para activar o inactivar según corresponda.

No mostrar formularios de depósitos, retiros o transferencias ni historial de movimientos.

## 4. Componentes

### BilleteraCard

Muestra saldo, moneda, estado, `usuario_id` e identificador de billetera.

### BilleteraForm

Permite ingresar el `usuario_id` externo y solicitar la creación.

Los formularios de consulta y cambio de estado deben limitarse a los endpoints definidos en `06-api.spec.md`.

## 5. Usuarios y otros microservicios

El frontend no contiene registro/administración de usuarios ni pantallas de depósitos o retiros. No llama a servicios externos cuyos contratos todavía no se definieron.

## 6. API

Centralizar las llamadas HTTP en:

```text
src/services/api.js
```

El frontend no incluye SQL ni acceso directo a PostgreSQL.

## 7. Diseño

Diseño simple y académico. Usar formularios, tarjetas, botones y mensajes de éxito/error. No implementar dashboard empresarial, gráficos, animaciones complejas, modo oscuro, internacionalización o autenticación.

## 8. Moneda

Mostrar saldos exclusivamente en soles con el prefijo `S/`. No mostrar USD.

## 9. Historial (SPEC 09)

Se sustituye la exclusi�n anterior del historial: la vista de billetera consulta el endpoint de movimientos y presenta ingresos/egresos, filtros de tipo/direcci�n/fechas, paginaci�n y estados de carga, error y vac�o. El frontend no permite registrar operaciones ni editar saldo.
