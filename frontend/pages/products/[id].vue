<script setup lang="ts">
import type { Product } from '~/types/product'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

// useFetch is SSR-aware: the server awaits the result and the HTML ships
// with the product already rendered. If the API returns 404 the response
// is non-2xx and `error` is populated, which we render below.
const { data: product, error, refresh: refetch } = await useFetch<Product>(
  `/api/products/${route.params.id}`,
  { baseURL: config.public.apiBase as string, key: `product-${route.params.id}` },
)

const { remove: deleteProduct, pending: deleting } = useDeleteProduct()
const confirmDelete = ref(false)

async function onDelete() {
  if (!product.value) return
  try {
    await deleteProduct(product.value.id)
    await router.push('/')
    // Force the catalog list to refetch so the deleted product disappears.
    // useAsyncData exposes a global refresh; this re-runs the key 'products'.
    const { data } = useNuxtData('products')
    if (data.value) {
      await refreshNuxtData('products')
    }
  } catch {
    // Stay on the page; the user can retry. (A future iteration could show
    // a banner with the error message.)
  }
}
</script>

<template>
  <section v-if="product" class="detail">
    <p class="detail__back">
      <NuxtLink to="/">← Back to catalog</NuxtLink>
    </p>

    <header class="detail__header">
      <h1>{{ product.name }}</h1>
      <p class="detail__price">
        <PriceTag :amount="product.price" />
      </p>
    </header>

    <p v-if="product.description" class="detail__description">
      {{ product.description }}
    </p>
    <p v-else class="detail__no-description">No description provided.</p>

    <dl class="detail__meta">
      <div>
        <dt>Listed</dt>
        <dd>{{ new Date(product.createdAt).toLocaleString('id-ID') }}</dd>
      </div>
      <div>
        <dt>Last updated</dt>
        <dd>{{ new Date(product.updatedAt).toLocaleString('id-ID') }}</dd>
      </div>
    </dl>

    <div class="detail__actions">
      <button v-if="!confirmDelete" type="button" @click="confirmDelete = true">
        Delete
      </button>
      <template v-else>
        <span>Are you sure?</span>
        <button type="button" :disabled="deleting" class="danger" @click="onDelete">
          {{ deleting ? 'Deleting…' : 'Yes, delete' }}
        </button>
        <button type="button" :disabled="deleting" @click="confirmDelete = false">
          Cancel
        </button>
      </template>
      <button type="button" @click="refetch">Refresh</button>
    </div>
  </section>

  <section v-else-if="error" class="detail detail--missing">
    <h1>Product not found</h1>
    <p>The product you're looking for doesn't exist or has been deleted.</p>
    <NuxtLink to="/">Back to catalog</NuxtLink>
  </section>
</template>

<style scoped>
.detail {
  max-width: 40rem;
}
.detail__back {
  font-size: 0.9rem;
  margin: 0 0 1rem;
}
.detail__back a {
  color: #2563eb;
  text-decoration: none;
}
.detail__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}
.detail__header h1 {
  font-size: 1.5rem;
  margin: 0;
}
.detail__price {
  font-size: 1.1rem;
  margin: 0;
}
.detail__description {
  font-size: 1rem;
  color: #1f2937;
  line-height: 1.6;
  margin: 0 0 1.5rem;
}
.detail__no-description {
  font-size: 0.9rem;
  color: #6b7280;
  font-style: italic;
  margin: 0 0 1.5rem;
}
.detail__meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 0.75rem 1.5rem;
  font-size: 0.85rem;
  color: #4b5563;
  margin: 0 0 1.5rem;
}
.detail__meta dt {
  font-weight: 600;
  color: #111827;
}
.detail__meta dd {
  margin: 0;
}
.detail__actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}
.detail__actions button {
  padding: 0.5rem 0.9rem;
  border: 1px solid #d1d5db;
  background: #fff;
  border-radius: 0.375rem;
  cursor: pointer;
  font: inherit;
}
.detail__actions button.danger {
  background: #b91c1c;
  color: #fff;
  border-color: #b91c1c;
}
.detail__actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.detail--missing {
  text-align: center;
  padding: 3rem 0;
  color: #6b7280;
}
</style>
