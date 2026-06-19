export type EstadoOrden = 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado'
export type EstadoMesa = 'libre' | 'ocupada' | 'por_pagar'
export type TipoDestino = 'cocina' | 'cafeteria'

export interface Categoria {
  id: string
  nombre: string
  orden: number
  icono: string | null
  tipo: TipoDestino
}

export interface ProductoOpcion {
  id: string
  producto_id: string
  texto: string
  created_at: string
}

export interface Variante {
  id: string
  producto_id: string
  nombre: string
  precio: number
  orden: number
}

export interface Producto {
  id: string
  nombre: string
  precio: number
  costo: number
  stock: number
  stock_minimo: number
  categoria_id: string
  disponible: boolean
  imagen_url: string | null
  descripcion: string | null
  ingredientes: string | null
  preparacion: string | null
  categorias?: Categoria
  producto_opciones?: ProductoOpcion[]
  variantes?: Variante[]
}

export type UnidadInsumo = 'kg' | 'g' | 'L' | 'ml' | 'pz'

export interface Insumo {
  id: string
  nombre: string
  unidad: string
  stock: number
  stock_minimo: number
  costo: number
  created_at: string
}

export type CategoriaGasto = 'renta' | 'sueldos' | 'servicios' | 'insumos' | 'mantenimiento' | 'general'

export interface Gasto {
  id: string
  concepto: string
  monto: number
  categoria: CategoriaGasto
  created_at: string
}

export interface Mesa {
  id: string
  numero: number
  estado: EstadoMesa
  capacidad: number
}

export interface OrdenItem {
  id: string
  orden_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  notas: string | null
  productos?: Producto
}

export interface Orden {
  id: string
  mesa_id: string
  estado: EstadoOrden
  destino: TipoDestino
  pagado: boolean
  created_at: string
  updated_at: string
  total: number
  notas: string | null
  mesas?: Mesa
  orden_items?: OrdenItem[]
}

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia'

export interface TicketItem {
  nombre: string
  cantidad: number
  precio_unitario: number
}

export interface Ticket {
  id: string
  folio: number
  mesa_numero: number | null
  total: number
  metodo_pago: MetodoPago
  items: TicketItem[]
  created_at: string
}

export interface ItemCarrito {
  producto: Producto
  variante?: Variante
  cantidad: number
  notas: string
}
