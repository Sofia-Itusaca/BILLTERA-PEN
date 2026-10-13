# SPEC 03 — ARQUITECTURA | BILLETERA PEN

## 1. Arquitectura general

El proyecto es un microservicio cliente-servidor con frontend y backend separados y una base de datos propia.

```text
FRONTEND React + Vite
        │ HTTP/REST + JSON
        ▼
BILLETERA API Node + Express
        │ Route → Controller → Service → Repository
        │ SQL
        ▼
PostgreSQL de Billetera
```

Usuarios, Depósitos y Retiros son microservicios de otros equipos. Sus contratos todavía no están definidos; no configurar URLs, puertos, endpoints, clientes HTTP ni contratos ficticios.

## 2. Propiedad de datos

Billetera es propietaria de la información de la entidad `billeteras`: identificador, referencia externa `usuario_id`, moneda, saldo, estado y fechas.

Usuarios es propietario de los usuarios y sus datos personales. Depósitos y Retiros son propietarios de sus respectivas operaciones. No duplicar sus entidades o historiales en esta base de datos.

## 3. Stack

- Frontend: React, Vite, JavaScript y CSS simple.
- Backend: Node.js, Express y JavaScript.
- Base de datos: PostgreSQL, acceso mediante `pg`.
- Configuración: `dotenv`.
- Comunicación: REST, HTTP y JSON.

## 4. Estructura obligatoria del backend

```text
backend/
└── src/
    ├── config/
    │   └── database.js
    ├── controllers/
    │   └── billetera.controller.js
    ├── services/
    │   └── billetera.service.js
    ├── repositories/
    │   └── billetera.repository.js
    ├── routes/
    │   └── billetera.routes.js
    ├── middlewares/
    │   └── error.middleware.js
    ├── app.js
    └── server.js
```

No crear capas o módulos de Usuarios, Depósitos, Retiros o Movimientos.

## 5. Estructura de referencia del frontend

```text
frontend/
└── src/
    ├── components/
    │   ├── BilleteraCard.jsx
    │   └── BilleteraForm.jsx
    ├── pages/
    │   ├── Inicio.jsx
    │   └── Billetera.jsx
    ├── services/
    │   └── api.js
    ├── App.jsx
    └── main.jsx
```

Los componentes se limitan a crear y consultar billeteras, mostrar saldo/estado y activar o inactivar.

## 6. Flujo interno del backend

```text
Route → Controller → Service → Repository → PostgreSQL
```

El controller recibe y valida datos básicos; el service aplica las reglas de Billetera; el repository ejecuta SQL parametrizado.

## 7. Restricciones

No agregar:

- CRUD de Usuarios ni tablas de usuarios.
- Funciones o endpoints de Depósitos, Retiros, Transferencias o Movimientos.
- Integraciones externas con contratos no definidos.
- Redux, GraphQL, WebSockets, API Gateway, Kafka, RabbitMQ o Kubernetes.
- Microservicios adicionales dentro de este proyecto.

Docker puede usarse por separado como entorno local de desarrollo para PostgreSQL; no forma parte de la arquitectura del microservicio.

## 8. Integración futura

La comunicación con Usuarios, Depósitos y Retiros se definirá únicamente cuando los equipos acuerden sus contratos. Este SPEC no asigna URLs, puertos ni endpoints externos.

## 9. Extensi�n de movimientos (SPEC 09)

El alcance anterior de exclusi�n de movimientos queda reemplazado por `09-movimientos.spec.md`: se agregan capas bajo Billetera sin crear otro servidor ni m�dulos internos de Dep�sitos/Retiros. El backend autentica esas fuentes por secretos configurados fuera del c�digo; no se configuran URLs ni credenciales externas.
