/**
 * DELETE /api/products/:id. Throws on non-2xx so the caller can render an
 * error. The detail page calls this from a click handler, then navigates
 * back to the catalog and triggers a refresh via `useAsyncData`.
 */
export function useDeleteProduct() {
  const config = useRuntimeConfig()
  const pending = ref(false)

  async function remove(id: number): Promise<void> {
    pending.value = true
    try {
      await $fetch(`/api/products/${id}`, {
        baseURL: config.public.apiBase as string,
        method: 'DELETE',
      })
    } finally {
      pending.value = false
    }
  }

  return { remove, pending }
}
