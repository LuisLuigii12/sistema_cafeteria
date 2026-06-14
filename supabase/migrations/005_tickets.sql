-- ============================================================
-- MIGRACIÓN 005 · Tickets / historial de ventas + cobro
-- Ejecutar en: Supabase → SQL Editor → New query → Run (sin RLS)
-- Idempotente.
-- ============================================================

-- Ticket = recibo inmutable de una cuenta cobrada.
-- folio: número de ticket consecutivo automático.
-- items: foto de lo vendido [{nombre, cantidad, precio_unitario}].
CREATE TABLE IF NOT EXISTS tickets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio        BIGSERIAL,
  mesa_numero  INTEGER,
  total        NUMERIC(10,2) NOT NULL DEFAULT 0,
  metodo_pago  TEXT NOT NULL DEFAULT 'efectivo',
  items        JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Marca de orden pagada (para no volver a cobrarla y separar sesiones de mesa)
ALTER TABLE ordenes ADD COLUMN IF NOT EXISTS pagado BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;

-- Agrega a realtime solo si aún no está (evita error "already member")
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
