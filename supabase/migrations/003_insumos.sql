-- ============================================================
-- MIGRACIÓN 003 · Insumos / ingredientes (no se venden directo)
-- Ejecutar en: Supabase → SQL Editor → New query → Run (sin RLS)
-- Idempotente.
-- ============================================================

-- Insumos: materia prima que se usa para preparar (café en grano, leche,
-- harina…). Se controla su stock pero NO aparece en el menú de venta.
CREATE TABLE IF NOT EXISTS insumos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       TEXT NOT NULL,
  unidad       TEXT NOT NULL DEFAULT 'pz',          -- kg, g, L, ml, pz
  stock        NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_minimo NUMERIC(10,2) NOT NULL DEFAULT 0,
  costo        NUMERIC(10,2) NOT NULL DEFAULT 0,     -- costo por unidad
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE insumos DISABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE insumos;

-- Insumos de ejemplo (solo si la tabla está vacía)
INSERT INTO insumos (nombre, unidad, stock, stock_minimo, costo)
SELECT * FROM (VALUES
  ('Café en grano',        'kg',  12, 3,  180),
  ('Leche',                'L',   20, 5,   22),
  ('Leche deslactosada',   'L',    8, 2,   26),
  ('Azúcar',               'kg',  10, 2,   25),
  ('Harina',               'kg',  15, 4,   18),
  ('Huevo',                'pz',  90, 30,   3),
  ('Mantequilla',          'kg',   4, 1,  140),
  ('Vasos para llevar',    'pz', 200, 50,   2)
) AS x(nombre, unidad, stock, stock_minimo, costo)
WHERE NOT EXISTS (SELECT 1 FROM insumos);
