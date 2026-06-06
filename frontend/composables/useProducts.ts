import { refDebounced } from '@vueuse/core'
import type { ProductsResponse } from '~/types/product'

export interface UseProductsOptions {
  page: Ref<number>
  limit: Ref<number>
  search: Ref<string>
}

/**
 * Fetches /api/products from the NestJS backend.
 *
 * SSR: `useAsyncData` awaits the first load and serializes the result into
 * the HTML payload — no `Loading…` flash on first paint.
 *
 * Re-fetch triggers (single source of truth via `useAsyncData`'s `watch`
 * array — never layer a manual `watch` on top, that double-fires):
 *   - `page` and `limit` flip immediately (discrete user actions)
 *   - `search` is debounced 300ms via `refDebounced` so we don't hammer
 *     the API on every keystroke
 *
 * Returns `refresh()` so callers can re-fetch after a mutation.
 */
export function useProducts(opts: UseProductsOptions) {
  const config = useRuntimeConfig()

  // Debounced mirror of the user's search ref. Page resets when the *user*
  // changes the search input (not on every debounce tick), so we mirror the
  // raw search with a separate `watch` here.
  const debouncedSearch = refDebounced(opts.search, 300)
  watch(opts.search, () => {
    opts.page.value = 1
  })

  const { data, pending, error, refresh } = useAsyncData(
    'products',
    () =>
      $fetch<ProductsResponse>('/api/products', {
        baseURL: config.public.apiBase as string,
        query: {
          page: opts.page.value,
          limit: opts.limit.value,
          search: debouncedSearch.value || undefined,
        },
      }),
    {
      watch: [opts.page, opts.limit, debouncedSearch],
    },
  )

  const products = computed(() => data.value?.data ?? [])
  const meta = computed(
    () =>
      data.value?.meta ?? {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
  )

  return {
    data: products,
    meta,
    pending,
    error,
    refresh,
  }
}
