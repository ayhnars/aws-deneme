export interface AuthResponse {
  token: string
  email: string
  fullName: string
  role: string
}

export interface Product {
  id: number
  name: string
  description?: string | null
  price: number
  stockQuantity: number
  createdAt: string
}

export interface ProductCreate {
  name: string
  description?: string
  price: number
  stockQuantity: number
}

export type MovementTypeName = 'In' | 'Out'
/** API accepts enum as number (0 = In, 1 = Out) until string JSON is enabled. */
export type MovementTypeApi = 0 | 1

export function movementTypeToApi(name: MovementTypeName): MovementTypeApi {
  return name === 'In' ? 0 : 1
}

export function isMovementIn(type: MovementTypeName | MovementTypeApi): boolean {
  return type === 'In' || type === 0
}

export interface StockMovement {
  id: number
  productId: number
  productName: string
  quantity: number
  movementType: MovementTypeName | MovementTypeApi
  createdAt: string
}

export interface StockMovementCreate {
  productId: number
  quantity: number
  movementType: MovementTypeName
}

export interface ApiError {
  message?: string
  error?: string
}
