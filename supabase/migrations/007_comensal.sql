-- ============================================================
-- MIGRACIÓN 007 · Columna comensal en orden_items
-- Ejecutar en: Supabase → SQL Editor → New query → Run
-- Idempotente.
-- ============================================================

-- Indica a qué comensal pertenece cada ítem (para cuentas divididas).
-- NULL = sin asignar (cuenta completa).
ALTER TABLE orden_items ADD COLUMN IF NOT EXISTS comensal INTEGER;
