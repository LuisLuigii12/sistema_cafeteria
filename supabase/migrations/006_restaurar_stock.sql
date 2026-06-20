-- 006_restaurar_stock.sql
-- Complementa el trigger existente que DESCUENTA stock al insertar un orden_item
-- (cuando se manda la orden). Aquí agregamos el caso contrario: cuando se BORRA
-- un producto de una orden (la mesera lo quita por error), se DEVUELVE ese stock
-- al producto, para que no quede descontado algo que en realidad no se vendió.
--
-- Idempotente: se puede correr varias veces sin problema.

CREATE OR REPLACE FUNCTION restaurar_stock_orden_item()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE productos
     SET stock = stock + OLD.cantidad
   WHERE id = OLD.producto_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orden_items_restaurar_stock ON orden_items;
CREATE TRIGGER orden_items_restaurar_stock
  AFTER DELETE ON orden_items
  FOR EACH ROW
  EXECUTE FUNCTION restaurar_stock_orden_item();
