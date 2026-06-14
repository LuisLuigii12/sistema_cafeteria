# PRODUCT.md — Valeria's Coffee POS

**Qué es:** Punto de venta (POS) para una cafetería con servicio en mesa.
**Register:** product (la UI sirve a la tarea; la herramienta debe desaparecer en el flujo).

## Quién lo usa
- **Mesera/o** (tablet en mostrador): toma órdenes, entrega, cobra. Persona ~40 años, no técnica. **La facilidad de uso manda.**
- **Cocina** y **Barra/Cafetería** (monitores por estación): preparan; tableros tipo KDS.
- **Dueño** (área de Administración): inventario, insumos, ventas, finanzas, configurar mesas.

## Superficies
- Operación: Mesas (grid), Ordenar (menú + panel de orden), Cocina/Cafetería (oscuras, KDS).
- Administración: Inventario, Ventas, Finanzas.

## Principios
1. **Una acción clara por pantalla.** Botón primario inconfundible.
2. **Lenguaje cotidiano, cero jerga** (ej. "Te quedó", no "Utilidad neta").
3. **Botones grandes** (dedo, ritmo rápido), estado seleccionado obvio (relleno).
4. **Operación separada de Administración.**
5. **Consistencia** de componentes entre pantallas; el deleite se reserva a momentos puntuales.

## Restricciones técnicas
- Next.js 16 (App Router) + Tailwind v4, tokens en `src/app/globals.css`.
- Supabase (anon key, RLS off). Migraciones las corre el dueño a mano.
