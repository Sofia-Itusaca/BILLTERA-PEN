CREATE TABLE IF NOT EXISTS billeteras (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id BIGINT NOT NULL CHECK (usuario_id > 0),
  moneda VARCHAR(3) NOT NULL DEFAULT 'PEN' CHECK (moneda = 'PEN'),
  saldo NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (saldo >= 0),
  estado VARCHAR(8) NOT NULL DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'INACTIVA')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Las instalaciones existentes aplican database/migrations/001_create_movimientos.sql.
