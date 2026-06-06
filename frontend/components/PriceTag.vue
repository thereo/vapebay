<script setup lang="ts">
/**
 * Renders a price string (DECIMAL-as-string from the backend) as a localized
 * IDR currency. Matches Filament's `->money('IDR', locale: 'id_ID')` so a
 * server-side `450000.00` shows as `Rp 450.000` in both UIs.
 *
 * Centralizing this here keeps every price renderer in the app consistent.
 */
const props = withDefaults(
  defineProps<{
    amount: string | number
    currency?: string
    locale?: string
  }>(),
  {
    currency: 'IDR',
    locale: 'id-ID',
  },
)

const formatted = computed(() => {
  const n = typeof props.amount === 'number' ? props.amount : Number(props.amount)
  return new Intl.NumberFormat(props.locale, {
    style: 'currency',
    currency: props.currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0)
})
</script>

<template>
  <span class="price">{{ formatted }}</span>
</template>

<style scoped>
.price {
  font-weight: 600;
}
</style>
