-- ============================================================
-- MIGRACIÓN 001 · Inventario y Finanzas
-- Ejecutar en: Supabase → SQL Editor → New query → Run
-- Es idempotente: se puede correr varias veces sin romper nada.
-- ============================================================

-- ── 1. Inventario en productos ──────────────────────────────
-- costo:         lo que nos cuesta producir/comprar el producto
-- stock:         existencias actuales
-- stock_minimo:  umbral para alerta de reabastecimiento
ALTER TABLE productos ADD COLUMN IF NOT EXISTS costo        DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock        INTEGER       NOT NULL DEFAULT 0;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock_minimo INTEGER       NOT NULL DEFAULT 5;

-- ── 2. Tabla de gastos operativos ───────────────────────────
-- Para registrar egresos que NO son costo de producto:
-- renta, sueldos, servicios, mantenimiento, etc.
CREATE TABLE IF NOT EXISTS gastos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concepto   TEXT NOT NULL,
  monto      DECIMAL(10,2) NOT NULL,
  categoria  TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. Descuento automático de stock al vender ──────────────
-- Cada vez que se agrega un item a una orden, baja el stock.
CREATE OR REPLACE FUNCTION descontar_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE productos
     SET stock = stock - NEW.cantidad
   WHERE id = NEW.producto_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orden_items_descuenta_stock ON orden_items;
CREATE TRIGGER orden_items_descuenta_stock
  AFTER INSERT ON orden_items
  FOR EACH ROW EXECUTE FUNCTION descontar_stock();

-- ── 4. Costos y existencias iniciales (datos de ejemplo) ────
-- Costo ≈ 30-40% del precio (margen típico de cafetería).
UPDATE productos SET costo = 10, stock = 100, stock_minimo = 20 WHERE nombre = 'Café Americano';
UPDATE productos SET costo = 14, stock = 100, stock_minimo = 20 WHERE nombre = 'Cappuccino';
UPDATE productos SET costo = 16, stock = 100, stock_minimo = 20 WHERE nombre = 'Latte';
UPDATE productos SET costo =  8, stock =  80, stock_minimo = 15 WHERE nombre = 'Té Verde';
UPDATE productos SET costo = 15, stock =  60, stock_minimo = 15 WHERE nombre = 'Jugo de Naranja';
UPDATE productos SET costo =  6, stock = 120, stock_minimo = 24 WHERE nombre = 'Agua Natural';
UPDATE productos SET costo =  9, stock =  90, stock_minimo = 20 WHERE nombre = 'Refresco';

UPDATE productos SET costo = 24, stock = 40, stock_minimo = 10 WHERE nombre = 'Huevos Revueltos';
UPDATE productos SET costo = 26, stock = 40, stock_minimo = 10 WHERE nombre = 'Hotcakes';
UPDATE productos SET costo = 32, stock = 35, stock_minimo =  8 WHERE nombre = 'Omelette';
UPDATE productos SET costo = 34, stock = 35, stock_minimo =  8 WHERE nombre = 'Chilaquiles';
UPDATE productos SET costo = 28, stock = 30, stock_minimo =  8 WHERE nombre = 'Enfrijoladas';

UPDATE productos SET costo = 20, stock = 30, stock_minimo =  8 WHERE nombre = 'Sopa del Día';
UPDATE productos SET costo = 48, stock = 25, stock_minimo =  6 WHERE nombre = 'Pollo a la Plancha';
UPDATE productos SET costo = 42, stock = 25, stock_minimo =  6 WHERE nombre = 'Pasta Primavera';
UPDATE productos SET costo = 36, stock = 25, stock_minimo =  6 WHERE nombre = 'Ensalada César';
UPDATE productos SET costo = 33, stock = 30, stock_minimo =  8 WHERE nombre = 'Sandwich Club';

UPDATE productos SET costo = 20, stock = 20, stock_minimo =  5 WHERE nombre = 'Pastel de Chocolate';
UPDATE productos SET costo = 22, stock = 20, stock_minimo =  5 WHERE nombre = 'Cheesecake';
UPDATE productos SET costo = 16, stock = 20, stock_minimo =  5 WHERE nombre = 'Flan';

UPDATE productos SET costo = 16, stock = 30, stock_minimo =  8 WHERE nombre = 'Tostadas';
UPDATE productos SET costo = 10, stock = 50, stock_minimo = 10 WHERE nombre = 'Galletas';

-- ── 5. Realtime + RLS ───────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE productos;
ALTER PUBLICATION supabase_realtime ADD TABLE gastos;
ALTER TABLE gastos DISABLE ROW LEVEL SECURITY;

-- ── 6. Gastos de ejemplo (opcional, para ver el módulo) ─────
INSERT INTO gastos (concepto, monto, categoria) VALUES
  ('Renta del local',        8000.00, 'renta'),
  ('Sueldos del personal',  12000.00, 'sueldos'),
  ('Luz y agua',             1500.00, 'servicios'),
  ('Compra de insumos café', 3200.00, 'insumos');
