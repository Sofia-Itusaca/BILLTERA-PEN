BEGIN;

CREATE TABLE IF NOT EXISTS movimientos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  billetera_id BIGINT NOT NULL REFERENCES billeteras(id),
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('DEPOSITO','RETIRO','TRANSFERENCIA','PAGO_SUSCRIPCION','COMISION_BANCARIA','AJUSTE','OTRO')),
  direccion VARCHAR(10) NOT NULL CHECK (direccion IN ('INGRESO','EGRESO')),
  monto NUMERIC(15,2) NOT NULL CHECK (monto > 0),
  origen VARCHAR(40) NOT NULL,
  servicio_origen VARCHAR(30) NOT NULL CHECK (servicio_origen IN ('DEPOSITOS','RETIROS')),
  descripcion VARCHAR(255),
  referencia_externa VARCHAR(100) NOT NULL,
  saldo_anterior NUMERIC(15,2) NOT NULL CHECK (saldo_anterior >= 0),
  saldo_posterior NUMERIC(15,2) NOT NULL CHECK (saldo_posterior >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT movimientos_servicio_referencia_uq UNIQUE (servicio_origen, referencia_externa)
);

CREATE INDEX IF NOT EXISTS movimientos_billetera_fecha_idx ON movimientos (billetera_id, created_at DESC, id DESC);
COMMIT;
