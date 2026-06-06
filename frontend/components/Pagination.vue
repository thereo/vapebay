<script setup lang="ts">
import type { PaginationMeta } from '~/types/product'

const props = defineProps<{ meta: PaginationMeta }>()
const emit = defineEmits<{ 'page-changed': [page: number] }>()

function go(delta: number) {
  const next = props.meta.page + delta
  if (next < 1 || next > props.meta.totalPages) return
  emit('page-changed', next)
}
</script>

<template>
  <nav v-if="meta.totalPages > 1" class="pagination">
    <button :disabled="meta.page <= 1" @click="go(-1)">Previous</button>
    <span>Page {{ meta.page }} of {{ meta.totalPages }} ({{ meta.total }} items)</span>
    <button :disabled="meta.page >= meta.totalPages" @click="go(1)">Next</button>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  font-size: 0.9rem;
}
.pagination button {
  padding: 0.4rem 0.8rem;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  cursor: pointer;
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
