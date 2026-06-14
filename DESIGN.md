# DESIGN.md — Valeria's Coffee

Sistema de diseño. Marca cafetería premium pero **register product**: refinamiento y jerarquía, no decoración.

## Identidad
- **Tipografía:** Playfair Display (serif) **solo** para momentos de marca: números héroe (mesa, total) y títulos de pantalla. Inter para todo lo demás (labels, botones, datos). Nunca serif en controles.
- **Voz visual:** cálida, café, artesanal pero ordenada. El carácter lo cargan el acento dorado, la tipografía de los héroes y la profundidad — no el fondo.

## Color (tokens en globals.css)
- **Café (tinta/oscuros):** `--espresso #1C0A00`, `--coffee #2C1407`, `--brown`.
- **Acento único — dorado:** `--gold #C9A96E`. Solo para acción primaria, selección y estado. Nunca decorativo.
- **Superficies (escalera):** página `--bg-cream` (cálido) < tarjeta `--bg-card` (blanco) — la profundidad nace del contraste de superficie + sombra, no de bordes.
- **Estado:** verde (ok/ganancia), ámbar (atención), rojo (alerta/pérdida). `*-soft` para fondos tenues.
- **Texto:** `--text-dark` y `--text-muted` (cálido, ≥4.5:1 sobre crema).

## Elevación
- Sombras **cálidas en capas** (`--shadow-sm/md/lg`). Tarjetas: **sombra, sin borde** (evitar el patrón "borde + sombra").
- Radios: tarjetas 16–20px, píldoras/botones full. Nada de 28px+.

## Prohibido (slop)
- **Barras de color al costado/arriba de tarjetas** como acento (`border-left`/stripe). Usar fondo tenue, ícono, número o nada.
- Borde 1px + sombra ancha en el mismo elemento (ghost-card).
- Texto con gradiente, glassmorphism decorativo, fondos rayados.

## Movimiento
- 150–250 ms, transmite estado (hover/active/selección/feedback). Sin coreografía de carga de página.
- `prefers-reduced-motion` siempre respetado.

## Componentes
- Cada interactivo: default / hover / focus-visible / active / disabled. Estado seleccionado = relleno dorado.
- Tableros KDS: superficie oscura `--bg-dark`, acento por urgencia (verde→ámbar→rojo).
