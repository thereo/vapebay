import type { CreateProductPayload, Product } from '~/types/product'

/**
 * POSTs to /api/products and returns the created row. Throws with
 * `error.data.message` (field-level errors) so the form can render them.
 */
export function useCreateProduct() {
  const config = useRuntimeConfig()
  const pending = ref(false)

  async function create(payload: CreateProductPayload): Promise<Product> {
    pending.value = true
    try {
      return await $fetch<Product>('/api/products', {
        baseURL: config.public.apiBase as string,
        method: 'POST',
        body: payload,
      })
    } finally {
      pending.value = false
    }
  }

  return { create, pending }
}
