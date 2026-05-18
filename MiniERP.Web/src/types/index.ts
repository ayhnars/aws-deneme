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

export interface StockMovement {
  id: number
  productId: number
  productName: string
  quantity: number
  movementType: 'In' | 'Out'
  createdAt: string
}

export interface StockMovementCreate {
  productId: number
  quantity: number
  movementType: 'In' | 'Out'
}

export interface ApiError {
  message?: string
  error?: string
}
