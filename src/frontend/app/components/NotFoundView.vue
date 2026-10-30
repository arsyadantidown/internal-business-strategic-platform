<script setup lang="ts">
const router = useRouter()

const handleGoBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/login')
  }
}
</script>

<template>
  <div
    class="flex h-screen min-h-screen w-full flex-col items-center justify-center p-6 text-center select-none overflow-hidden"
    style="background-color: #f8fafc"
  >
    <!-- Gambar Ilustrasi 404 Astronaut -->
    <div class="flex items-center justify-center w-full max-w-[340px] sm:max-w-[380px]">
      <img
        src="~/assets/404.png"
        alt="404 Page Not Found"
        class="h-auto max-h-[170px] sm:max-h-[190px] w-auto max-w-full object-contain pointer-events-none drop-shadow-xs"
      />
    </div>

    <!-- Teks Judul & Deskripsi -->
    <div class="mt-4 max-w-md space-y-1.5">
      <h1 class="text-xl sm:text-[22px] font-bold tracking-tight text-[#0f172a]">Page Not Found</h1>
      <p class="text-xs sm:text-[13px] text-[#64748b] leading-relaxed font-normal">
        The page you’re looking for doesn’t exist or may have been moved.<br
          class="hidden sm:inline"
        />
        Please check the URL or go back to a valid page.
      </p>
    </div>

    <!-- Hanya Tombol Go Back -->
    <div class="mt-5 flex items-center justify-center">
      <UButton
        size="lg"
        variant="solid"
        icon="i-lucide-arrow-left"
        style="background-color: #1570ef; color: #ffffff"
        class="h-9.5 rounded-xl px-5 text-xs font-semibold shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        @click="handleGoBack"
      >
        Go Back
      </UButton>
    </div>
  </div>
</template>
