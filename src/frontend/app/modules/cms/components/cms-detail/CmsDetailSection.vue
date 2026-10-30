<script setup lang="ts">
interface Props {
  title: string
  icon?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'i-lucide-layers'
})
</script>

<template>
  <section class="mt-4">
    <div class="mb-2 flex items-center gap-2">
      <UIcon
        :name="icon"
        class="h-3.5 w-3.5 text-slate-400"
      />
      <h3 class="text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {{ title }}
      </h3>
    </div>
    <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <slot />
    </div>
  </section>
</template>
