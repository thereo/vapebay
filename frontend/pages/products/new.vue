<script setup lang="ts">
import type { CreateProductPayload } from '~/types/product'

const { create, pending } = useCreateProduct()
const errors = ref<string[]>([])

async function onSubmit(payload: CreateProductPayload) {
  errors.value = []
  try {
    await create(payload)
    await navigateTo('/')
  } catch (e: unknown) {
    const data = (e as { data?: { message?: string[] | string } }).data
    const msg = data?.message
    errors.value = Array.isArray(msg) ? msg : msg ? [msg] : ['Failed to create product.']
  }
}
</script>

<template>
  <section>
    <h1>Add New Product</h1>
    <ProductForm :pending="pending" :errors="errors" @submit="onSubmit" />
    <p>
      <NuxtLink to="/">Back to catalog</NuxtLink>
    </p>
  </section>
</template>

<style scoped>
h1 {
  font-size: 1.5rem;
  margin: 0 0 1rem;
}
</style>
