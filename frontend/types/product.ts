// Shared types — must match the NestJS backend envelope.

export interface Product {
  id: number
  name: string
  description: string | null
  price: string // DECIMAL(10,2) returned as string to preserve precision
  createdAt: string
  updatedAt: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProductsResponse {
  data: Product[]
  meta: PaginationMeta
}

export interface CreateProductPayload {
  name: string
  description?: string
  price: number
}
