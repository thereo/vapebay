<script setup lang="ts">
// Root layout — replaces the default NuxtWelcome. Pages render into <NuxtPage />.
</script>

<template>
  <div class="layout">
    <header class="layout__header">
      <NuxtLink to="/" class="layout__brand">VapeBay</NuxtLink>
      <nav>
        <NuxtLink to="/">Catalog</NuxtLink>
        <NuxtLink to="/products/new">Add product</NuxtLink>
      </nav>
    </header>
    <main class="layout__main">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
.layout {
  font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
  color: #111827;
  max-width: 64rem;
  margin: 0 auto;
  padding: 1.5rem;
}
.layout__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}
.layout__brand {
  font-weight: 700;
  font-size: 1.25rem;
  text-decoration: none;
  color: inherit;
}
.layout__header nav {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
}
.layout__header nav a {
  color: #2563eb;
  text-decoration: none;
}
</style>
