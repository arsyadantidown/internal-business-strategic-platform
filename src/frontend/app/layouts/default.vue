<script setup lang="ts">
const route = useRoute()

// Daftar prefix rute internal yang punya Sidebar & Navbar
const internalPrefixes = [
  '/dashboard',
  '/admin',
  '/partnership',
  '/portofolio',
  '/analytics',
  '/notifications'
]

// Sidebar HANYA tampil untuk rute internal yang sah
const showSidebar = computed(() => {
  return internalPrefixes.some((prefix) => route.path.startsWith(prefix))
})
</script>

<template>
  <!-- 1. Halaman Internal / Dashboard (Dengan Sidebar & Navbar) -->
  <div v-if="showSidebar" class="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900">
    <LayoutAppSidebar />
    <div class="flex flex-1 flex-col overflow-hidden">
      <LayoutAppNavbar />
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>

  <!-- 2. Halaman Publik, Landing, & Semua Halaman 404 (Full Screen Bersih) -->
  <div v-else class="min-h-screen w-full bg-white">
    <slot />
  </div>
</template>
