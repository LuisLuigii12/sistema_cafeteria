-- ============================================================
-- MIGRACIÓN: Agregar destino a categorías y órdenes
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Agregar columna tipo a categorias
ALTER TABLE categorias
  ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'cocina'
  CHECK (tipo IN ('cocina', 'cafeteria'));

-- 2. Agregar columna destino a ordenes
ALTER TABLE ordenes
  ADD COLUMN IF NOT EXISTS destino TEXT NOT NULL DEFAULT 'cocina'
  CHECK (destino IN ('cocina', 'cafeteria'));

-- 3. Actualizar las categorías existentes
UPDATE categorias SET tipo = 'cafeteria' WHERE nombre IN ('Bebidas');
UPDATE categorias SET tipo = 'cocina'    WHERE nombre IN ('Desayunos', 'Comidas', 'Postres', 'Snacks');
