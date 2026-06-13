-- ============================================================
-- SCHEMA: Sistema Cafeteria POS
-- ============================================================

-- Categorias del menu
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  icono TEXT
);

-- Productos del menu
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  costo DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 5,
  categoria_id UUID NOT NULL REFERENCES categorias(id),
  disponible BOOLEAN NOT NULL DEFAULT true,
  imagen_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gastos operativos (egresos que no son costo de producto)
CREATE TABLE gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concepto TEXT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Opciones rápidas por producto (ej. Café → "Sin azúcar")
CREATE TABLE producto_opciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insumos / ingredientes (no se venden directo; se usan para preparar)
CREATE TABLE insumos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  unidad TEXT NOT NULL DEFAULT 'pz',
  stock NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_minimo NUMERIC(10,2) NOT NULL DEFAULT 0,
  costo NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mesas de la cafeteria
CREATE TABLE mesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER NOT NULL UNIQUE,
  estado TEXT NOT NULL DEFAULT 'libre' CHECK (estado IN ('libre', 'ocupada', 'por_pagar')),
  capacidad INTEGER NOT NULL DEFAULT 4
);

-- Ordenes
CREATE TABLE ordenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mesa_id UUID NOT NULL REFERENCES mesas(id),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_preparacion', 'listo', 'entregado', 'cancelado')),
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Items de cada orden
CREATE TABLE orden_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id UUID NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id),
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para actualizar updated_at en ordenes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ordenes_updated_at
  BEFORE UPDATE ON ordenes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- DATOS DE EJEMPLO
-- ============================================================

INSERT INTO categorias (nombre, orden, icono) VALUES
  ('Desayunos', 1, '🍳'),
  ('Comidas', 2, '🍽️'),
  ('Bebidas', 3, '☕'),
  ('Postres', 4, '🍰'),
  ('Snacks', 5, '🥪');

INSERT INTO mesas (numero, capacidad) VALUES
  (1, 2), (2, 4), (3, 4), (4, 6),
  (5, 2), (6, 4), (7, 8), (8, 4);

-- Bebidas
INSERT INTO productos (nombre, precio, categoria_id, disponible) VALUES
  ('Café Americano', 35.00, (SELECT id FROM categorias WHERE nombre = 'Bebidas'), true),
  ('Cappuccino', 45.00, (SELECT id FROM categorias WHERE nombre = 'Bebidas'), true),
  ('Latte', 50.00, (SELECT id FROM categorias WHERE nombre = 'Bebidas'), true),
  ('Té Verde', 30.00, (SELECT id FROM categorias WHERE nombre = 'Bebidas'), true),
  ('Jugo de Naranja', 40.00, (SELECT id FROM categorias WHERE nombre = 'Bebidas'), true),
  ('Agua Natural', 20.00, (SELECT id FROM categorias WHERE nombre = 'Bebidas'), true),
  ('Refresco', 25.00, (SELECT id FROM categorias WHERE nombre = 'Bebidas'), true);

-- Desayunos
INSERT INTO productos (nombre, precio, categoria_id, disponible) VALUES
  ('Huevos Revueltos', 65.00, (SELECT id FROM categorias WHERE nombre = 'Desayunos'), true),
  ('Hotcakes', 70.00, (SELECT id FROM categorias WHERE nombre = 'Desayunos'), true),
  ('Omelette', 85.00, (SELECT id FROM categorias WHERE nombre = 'Desayunos'), true),
  ('Chilaquiles', 90.00, (SELECT id FROM categorias WHERE nombre = 'Desayunos'), true),
  ('Enfrijoladas', 75.00, (SELECT id FROM categorias WHERE nombre = 'Desayunos'), true);

-- Comidas
INSERT INTO productos (nombre, precio, categoria_id, disponible) VALUES
  ('Sopa del Día', 55.00, (SELECT id FROM categorias WHERE nombre = 'Comidas'), true),
  ('Pollo a la Plancha', 120.00, (SELECT id FROM categorias WHERE nombre = 'Comidas'), true),
  ('Pasta Primavera', 110.00, (SELECT id FROM categorias WHERE nombre = 'Comidas'), true),
  ('Ensalada César', 95.00, (SELECT id FROM categorias WHERE nombre = 'Comidas'), true),
  ('Sandwich Club', 85.00, (SELECT id FROM categorias WHERE nombre = 'Comidas'), true);

-- Postres
INSERT INTO productos (nombre, precio, categoria_id, disponible) VALUES
  ('Pastel de Chocolate', 55.00, (SELECT id FROM categorias WHERE nombre = 'Postres'), true),
  ('Cheesecake', 60.00, (SELECT id FROM categorias WHERE nombre = 'Postres'), true),
  ('Flan', 45.00, (SELECT id FROM categorias WHERE nombre = 'Postres'), true);

-- Snacks
INSERT INTO productos (nombre, precio, categoria_id, disponible) VALUES
  ('Tostadas', 45.00, (SELECT id FROM categorias WHERE nombre = 'Snacks'), true),
  ('Galletas', 30.00, (SELECT id FROM categorias WHERE nombre = 'Snacks'), true);

-- ============================================================
-- REALTIME: habilitar para ordenes y orden_items
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE ordenes;
ALTER PUBLICATION supabase_realtime ADD TABLE orden_items;
ALTER PUBLICATION supabase_realtime ADD TABLE mesas;

-- ============================================================
-- RLS: deshabilitar para uso interno (sin autenticacion)
-- ============================================================
ALTER TABLE categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE mesas DISABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes DISABLE ROW LEVEL SECURITY;
ALTER TABLE orden_items DISABLE ROW LEVEL SECURITY;
