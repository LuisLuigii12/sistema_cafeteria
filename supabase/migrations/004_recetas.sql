-- ============================================================
-- MIGRACIÓN 004 · Recetas / guía de preparación por producto
-- Ejecutar en: Supabase → SQL Editor → New query → Run (sin RLS)
-- Idempotente.
-- ============================================================

-- ingredientes: qué lleva el platillo (una línea por ingrediente)
-- preparacion:  cómo se hace (un paso por línea)
ALTER TABLE productos ADD COLUMN IF NOT EXISTS ingredientes TEXT;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS preparacion  TEXT;

-- Recetas de ejemplo (solo si el producto aún no tiene ingredientes)
UPDATE productos SET
  ingredientes = E'Totopos de maíz\nSalsa verde o roja\nPollo deshebrado\nCrema\nQueso fresco\nCebolla en aros\nCilantro',
  preparacion  = E'1. Calienta la salsa en un sartén hasta que hierva\n2. Agrega los totopos y mezcla 30 seg (que no se aguaden)\n3. Sirve en el plato\n4. Decora con crema, queso, cebolla y cilantro\n5. Agrega el pollo encima'
WHERE nombre = 'Chilaquiles' AND ingredientes IS NULL;

UPDATE productos SET
  ingredientes = E'1 shot de espresso\n150 ml de leche\nEspuma de leche',
  preparacion  = E'1. Extrae 1 shot de espresso en la taza\n2. Vaporiza la leche hasta crear espuma cremosa\n3. Vierte la leche dejando 1 cm de espuma\n4. Sirve de inmediato'
WHERE nombre = 'Cappuccino' AND ingredientes IS NULL;

UPDATE productos SET
  ingredientes = E'1 shot de espresso\n200 ml de leche vaporizada\nPoca espuma',
  preparacion  = E'1. Extrae 1 shot de espresso\n2. Vaporiza la leche (más leche, menos espuma que el capuchino)\n3. Vierte la leche sobre el espresso\n4. Termina con una capa fina de espuma'
WHERE nombre = 'Latte' AND ingredientes IS NULL;

UPDATE productos SET
  ingredientes = E'3 huevos\nLeche (un chorrito)\nSal\nMantequilla',
  preparacion  = E'1. Bate los huevos con la leche y una pizca de sal\n2. Derrite mantequilla en el sartén a fuego medio\n3. Vierte los huevos y mueve suave\n4. Retira cuando estén cremosos (no secos)'
WHERE nombre = 'Huevos Revueltos' AND ingredientes IS NULL;

UPDATE productos SET
  ingredientes = E'Harina para hotcakes\nLeche\n1 huevo\nMantequilla\nMiel de maple',
  preparacion  = E'1. Mezcla la harina, leche y huevo hasta una masa lisa\n2. Calienta el sartén con poca mantequilla\n3. Vierte la masa y voltea cuando salgan burbujas\n4. Sirve en torre con mantequilla y miel'
WHERE nombre = 'Hotcakes' AND ingredientes IS NULL;

UPDATE productos SET
  ingredientes = E'Café molido (espresso)\nAgua caliente',
  preparacion  = E'1. Extrae 1-2 shots de espresso\n2. Agrega agua caliente al gusto\n3. Sirve'
WHERE nombre = 'Café Americano' AND ingredientes IS NULL;
