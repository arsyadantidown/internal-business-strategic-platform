<script setup lang="ts">
interface Props {
  solutions: string[]
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs">
    <!-- Header -->
    <div class="flex items-center gap-2.5 text-slate-900">
      <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <UIcon name="i-lucide-cpu" class="h-4.5 w-4.5" />
      </div>
      <h2 class="text-base font-bold tracking-tight">Implemented Solution</h2>
    </div>

    <!-- Solution Description & Checklist -->
    <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
      We delivered an end-to-end strategic and technical solution tailored to address core project
      requirements, drive operational efficiency, and ensure sustainable scalability:
    </p>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
      <!-- Left: Checklist Bullet Points -->
      <ul class="space-y-2.5 text-xs sm:text-sm text-slate-700 md:col-span-8">
        <li v-for="(sol, idx) in solutions" :key="idx" class="flex items-start gap-2.5">
          <div
            class="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
          >
            <UIcon name="i-lucide-check" class="h-3 w-3" />
          </div>
          <span>{{ sol }}</span>
        </li>
      </ul>

      <!-- Right: Mockup Illustration Graphic -->
      <div class="flex items-center justify-center md:col-span-4">
        <div
          class="group relative h-36 sm:h-40 w-full overflow-hidden rounded-xl border border-slate-200 shadow-xs"
        >
          <img
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop"
            alt="Implemented Solution Tech Preview"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent"
          />
          <div class="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-white/90">
            <UIcon name="i-lucide-code-2" class="h-3.5 w-3.5 text-blue-400" />
            <span class="text-[11px] font-medium tracking-wide">System Implementation</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
