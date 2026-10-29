// TODO: reemplazar por los datos del backend (ms-inventario)
export const DEPOSITOS = ['Depósito Central', 'Depósito Norte', 'Depósito Sur']

export const PRODUCTOS = [
  { codigo: 'PRD-000001', nombre: 'Martillo carpintero 16 oz',       precio: 45000,  stock: 120, estado: 'En stock' },
  { codigo: 'PRD-000002', nombre: 'Cemento Portland bolsa 50 kg',    precio: 62000,  stock: 8,   estado: 'Stock bajo' },
  { codigo: 'PRD-000003', nombre: 'Tornillo autoperforante 1" x100', precio: 18000,  stock: 340, estado: 'En stock' },
  { codigo: 'PRD-000004', nombre: 'Pintura látex blanco 20 L',       precio: 385000, stock: 15,  estado: 'En stock' },
  { codigo: 'PRD-000005', nombre: 'Cable unipolar 2,5 mm rollo 100 m', precio: 290000, stock: 4, estado: 'Stock bajo' },
]

export const gs = (n) => n.toLocaleString('es-PY') + ' Gs.'
export const fechaCorta = (iso) => iso.split('-').reverse().join('/')   // 2026-08-20 -> 20/08/2026