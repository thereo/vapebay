<script setup lang="ts">
import type { CreateProductPayload } from '~/types/product'

const props = defineProps<{ pending: boolean; errors?: string[] }>()
const emit = defineEmits<{ submit: [payload: CreateProductPayload] }>()

const name = ref('')
const description = ref('')
const price = ref<number | null>(null)

function onSubmit() {
  if (price.value === null) return
  emit('submit', {
    name: name.value.trim(),
    description: description.value.trim() || undefined,
    price: Number(price.value),
  })
}
</script>

<template>
  <form class="product-form" @submit.prevent="onSubmit">
    <label class="product-form__field">
      <span>Name</span>
      <input v-model="name" required minlength="2" maxlength="255" type="text" />
    </label>

    <label class="product-form__field">
      <span>Description</span>
      <textarea v-model="description" maxlength="1000" rows="3" />
    </label>

    <label class="product-form__field">
      <span>Price (IDR)</span>
      <input v-model.number="price" required min="0" step="0.01" type="number" />
    </label>

    <ul v-if="errors && errors.length" class="product-form__errors">
      <li v-for="(err, i) in errors" :key="i">{{ err }}</li>
    </ul>

    <button type="submit" :disabled="pending || !name || price === null">
      {{ pending ? 'Saving…' : 'Add product' }}
    </button>
  </form>
</template>

<style scoped>
.product-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 32rem;
}
.product-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}
.product-form__field input,
.product-form__field textarea {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font: inherit;
}
.product-form__errors {
  color: #b91c1c;
  font-size: 0.85rem;
  margin: 0;
  padding-left: 1.25rem;
}
button {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  background: #111827;
  color: #fff;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}
button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
