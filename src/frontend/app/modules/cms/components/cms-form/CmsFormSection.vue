<script setup lang="ts">
interface Props {
  title: string
  description?: string
  icon?: string
  collapsible?: boolean
}

withDefaults(defineProps<Props>(), {
  description: '',
  icon: 'i-lucide-layers',
  collapsible: false
})

const isOpen = defineModel<boolean>('open', { default: true })
</script>

<template>
  <section class="rounded-xl border border-slate-200/80 bg-white p-4">
    <div
      class="relative flex items-start gap-2.5"
      :class="isOpen || !collapsible ? 'mb-3 border-b border-slate-100 pb-2.5' : ''"
    >
      <button
        v-if="collapsible"
        type="button"
        data-cms-section-toggle
        class="absolute inset-0 z-10 cursor-pointer rounded-md focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2 focus-visible:outline-none"
        :aria-expanded="isOpen"
        :aria-label="`${isOpen ? 'Minimize' : 'Expand'} ${title}`"
        @click="isOpen = !isOpen"
      />

      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <UIcon
          :name="icon"
          class="h-3.5 w-3.5"
        />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-xs font-bold tracking-tight text-slate-900">
          {{ title }}
        </h3>
        <p
          v-if="description"
          class="mt-0.5 text-[10px] text-slate-400"
        >
          {{ description }}
        </p>
      </div>
      <UIcon
        v-if="collapsible"
        data-cms-section-chevron
        :name="isOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        class="mt-1 h-3.5 w-3.5 shrink-0 text-slate-400"
      />
    </div>

    <div
      v-show="isOpen"
      class="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      <slot />
    </div>
  </section>
</template>
