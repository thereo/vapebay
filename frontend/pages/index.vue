<script setup lang="ts">
const page = ref(1)
const limit = ref(10)
const search = ref('')

const { data, meta, pending, error, refresh } = useProducts({
  page,
  limit,
  search,
})

function onPageChanged(next: number) {
  page.value = next
}
</script>

<template>
  <section>
    <h1>Product catalog</h1>

    <input
      v-model="search"
      type="search"
      class="search"
      placeholder="Search devices, e-liquids, accessories..."
    />

    <p v-if="pending">Loading…</p>
    <p v-else-if="error">Failed to load products. Try refreshing.</p>
    <p v-else-if="data.length === 0" class="empty">No products found in our catalog</p>

    <div v-else class="grid">
      <ProductCard v-for="p in data" :key="p.id" :product="p" />
    </div>

    <Pagination :meta="meta" @page-changed="onPageChanged" />

    <button class="refresh" type="button" @click="refresh">Refresh</button>
  </section>
</template>

<style scoped>
h1 {
  font-size: 1.5rem;
  margin: 0 0 1rem;
}
.search {
  width: 100%;
  padding: 0.6rem 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font: inherit;
}
.empty {
  color: #6b7280;
}
.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
}
.refresh {
  margin-top: 1rem;
  font-size: 0.85rem;
  background: transparent;
  color: #2563eb;
  border: none;
  cursor: pointer;
}
</style>
