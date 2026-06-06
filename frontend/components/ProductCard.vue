<script setup lang="ts">
import type { Product } from '~/types/product'

defineProps<{ product: Product }>()
</script>

<template>
  <article class="product-card">
    <h3 class="product-card__name">
      <NuxtLink :to="`/products/${product.id}`">{{ product.name }}</NuxtLink>
    </h3>
    <p v-if="product.description" class="product-card__desc">
      {{ product.description }}
    </p>
    <p class="product-card__price">
      <PriceTag :amount="product.price" />
    </p>
  </article>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #fff;
}
.product-card__name {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0;
}
.product-card__name a {
  color: inherit;
  text-decoration: none;
}
.product-card__name a:hover {
  text-decoration: underline;
}
.product-card__desc {
  font-size: 0.9rem;
  color: #4b5563;
  margin: 0;
}
.product-card__price {
  font-size: 1rem;
  color: #111827;
  margin: 0;
}
</style>
