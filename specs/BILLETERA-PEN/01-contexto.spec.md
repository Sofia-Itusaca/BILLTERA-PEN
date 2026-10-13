# SPEC 01 — CONTEXTO | BILLETERA PEN

## 1. Objetivo

Definir el Microservicio de Billetera PEN, responsable de administrar la entidad billetera y su información propia: asociación con un `usuario_id` externo, moneda, saldo y estado.

El proyecto permite crear y consultar billeteras, consultar su saldo y activar o inactivar su estado.

## 2. Distribución de microservicios

El sistema completo considera microservicios independientes:

1. Usuarios
2. Billetera
3. Depósitos
4. Retiros

Este repositorio contiene únicamente el Microservicio de Billetera. Los demás servicios pertenecen a otros equipos y no se implementan aquí.

## 3. Alcance de Billetera

Incluye:

- Frontend web para crear, consultar y administrar el estado de una billetera.
- API REST propia.
- Base de datos PostgreSQL con información propia de billeteras.
- Asociación mediante `usuario_id`, que es una referencia externa.
- Moneda fija PEN.
- Consulta de saldo.
- Activación e inactivación de billeteras.

No incluye depósitos, retiros, transferencias, historial de movimientos ni lógica de esos servicios.

## 4. Responsabilidad sobre otros servicios

### Usuarios

Usuarios pertenece a otro equipo. Billetera no crea, consulta ni administra usuarios y no mantiene datos personales. Solo almacena `usuario_id` como referencia externa. El contrato de integración con Usuarios aún no está definido y no debe inventarse.

### Depósitos y Retiros

Son microservicios independientes. Billetera no implementa ni registra sus operaciones. La futura comunicación HTTP/REST para afectar el saldo queda pendiente del acuerdo entre equipos. Hasta que ese contrato se defina, no se inventan endpoints, URLs, puertos ni formatos de integración.

## 5. Moneda y saldo

La única moneda admitida es PEN (sol peruano). Una billetera nueva inicia con saldo `0.00`. Los valores se almacenan con precisión decimal. No se implementan USD, conversiones ni tipo de cambio.

## 6. Fuera de alcance

No implementar:

- Depósitos, retiros, transferencias ni movimientos monetarios.
- CRUD, registro o autenticación de usuarios.
- Tabla local `usuarios` o FK hacia ella.
- Integraciones con contratos externos todavía no acordados.
- USD, conversión PEN/USD o tipo de cambio.
- Tarjetas, préstamos, QR, pasarelas, notificaciones o reportes avanzados.
- Otros microservicios, API Gateway, Docker como arquitectura de la aplicación, Kubernetes, Kafka o RabbitMQ.

## 7. Arquitectura

Separación cliente-servidor:

- Frontend: React, Vite y JavaScript.
- Backend: Node.js, Express y JavaScript.
- Datos: PostgreSQL, consultado únicamente desde el backend.
- Comunicación interna: HTTP/REST y JSON.

```text
Frontend React + Vite
        │ HTTP/REST + JSON
        ▼
Billetera API (Node + Express)
        │ SQL
        ▼
PostgreSQL de Billetera
```

## 8. Regla de decisión

Estos SPEC son la fuente de verdad. Si una decisión no está definida y puede cambiar la arquitectura, el alcance o un contrato entre microservicios, debe consultarse antes de implementarla.

## 9. Extensi�n de alcance (SPEC 09)

El alcance ahora incluye recibir movimientos confirmados autorizados y consultar historial en la billetera. Esto no implementa los procesos de Dep�sitos/Retiros ni integraci�n real con otros equipos; ver SPEC 09 para autorizaci�n y acuerdos pendientes.
