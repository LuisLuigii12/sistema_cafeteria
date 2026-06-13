export type EstadoOrden = 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado'
export type EstadoMesa = 'libre' | 'ocupada' | 'por_pagar'

export interface Categoria {
  id: string
  nombre: string
  orden: number
  icono: string | null
}

export interface ProductoOpcion {
  id: string
  producto_id: string
  texto: string
  created_at: string
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
  categorias?: Categoria
  producto_opciones?: ProductoOpcion[]
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
  created_at: string
  updated_at: string
  total: number
  notas: string | null
  mesas?: Mesa
  orden_items?: OrdenItem[]
}

export interface ItemCarrito {
  producto: Producto
  cantidad: number
  notas: string
}
