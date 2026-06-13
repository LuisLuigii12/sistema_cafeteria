-- ============================================================
-- MIGRACIÓN 002 · Opciones / indicaciones por producto
-- Ejecutar en: Supabase → SQL Editor → New query → Run (sin RLS)
-- Idempotente.
-- ============================================================

-- ── 1. Tabla de opciones rápidas por producto ───────────────
-- Cada fila es un "chip" que se puede agregar al producto:
-- ej. Café → "Sin azúcar", Chilaquiles → "Verdes".
CREATE TABLE IF NOT EXISTS producto_opciones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  texto       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_producto_opciones_producto ON producto_opciones(producto_id);

-- ── 2. Realtime + RLS ───────────────────────────────────────
ALTER TABLE producto_opciones DISABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE producto_opciones;

-- ── 3. Opciones iniciales (solo si el producto aún no tiene) ─
INSERT INTO producto_opciones (producto_id, texto)
SELECT p.id, x.texto
FROM productos p
JOIN (VALUES
  ('Chilaquiles', 'Rojos'),
  ('Chilaquiles', 'Verdes'),
  ('Chilaquiles', 'Con pollo'),
  ('Chilaquiles', 'Con huevo'),
  ('Chilaquiles', 'Sin cebolla'),
  ('Chilaquiles', 'Sin crema'),
  ('Enfrijoladas', 'Con pollo'),
  ('Enfrijoladas', 'Con queso'),
  ('Enfrijoladas', 'Sin cebolla'),
  ('Enfrijoladas', 'Extra salsa'),
  ('Huevos Revueltos', 'Con jamón'),
  ('Huevos Revueltos', 'A la mexicana'),
  ('Huevos Revueltos', 'Sin sal'),
  ('Huevos Revueltos', 'Bien cocidos'),
  ('Omelette', 'Con jamón'),
  ('Omelette', 'Con queso'),
  ('Omelette', 'Con champiñones'),
  ('Omelette', 'Sin cebolla'),
  ('Hotcakes', 'Extra miel'),
  ('Hotcakes', 'Con mantequilla'),
  ('Hotcakes', 'Sin azúcar'),
  ('Café Americano', 'Sin azúcar'),
  ('Café Americano', 'Cargado'),
  ('Café Americano', 'Descafeinado'),
  ('Café Americano', 'Para llevar'),
  ('Café Americano', 'Frío'),
  ('Cappuccino', 'Sin azúcar'),
  ('Cappuccino', 'Deslactosada'),
  ('Cappuccino', 'Extra espuma'),
  ('Cappuccino', 'Canela'),
  ('Cappuccino', 'Para llevar'),
  ('Latte', 'Sin azúcar'),
  ('Latte', 'Deslactosada'),
  ('Latte', 'Vainilla'),
  ('Latte', 'Caramelo'),
  ('Latte', 'Para llevar'),
  ('Pollo a la Plancha', 'Sin sal'),
  ('Pollo a la Plancha', 'Bien cocido'),
  ('Pollo a la Plancha', 'Salsa aparte'),
  ('Pollo a la Plancha', 'Sin grasa'),
  ('Ensalada César', 'Sin crutones'),
  ('Ensalada César', 'Aderezo aparte'),
  ('Ensalada César', 'Con pollo'),
  ('Ensalada César', 'Sin queso'),
  ('Sandwich Club', 'Sin cebolla'),
  ('Sandwich Club', 'Sin jitomate'),
  ('Sandwich Club', 'Pan tostado'),
  ('Sandwich Club', 'Papas aparte')
) AS x(nombre, texto) ON x.nombre = p.nombre
WHERE NOT EXISTS (
  SELECT 1 FROM producto_opciones po WHERE po.producto_id = p.id
);
