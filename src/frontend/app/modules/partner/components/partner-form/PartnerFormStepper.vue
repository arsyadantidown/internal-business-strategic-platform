<script setup lang="ts">
interface StepMeta {
  label: string
  icon: string
}

interface Props {
  steps: StepMeta[]
  currentStep: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select', step: number): void
}>()

const isComplete = (step: number): boolean => step < props.currentStep
const isCurrent = (step: number): boolean => step === props.currentStep
const isSelectable = (step: number): boolean => step < props.currentStep

const selectStep = (step: number) => {
  if (isSelectable(step)) emit('select', step)
}
</script>

<template>
  <div class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
    <div class="flex items-center gap-1 sm:gap-2">
      <template
        v-for="(step, index) in steps"
        :key="step.label"
      >
        <button
          type="button"
          class="group flex shrink-0 items-center gap-2 rounded-lg p-1 cursor-pointer"
          :class="isSelectable(index) ? '' : 'cursor-default'"
          :disabled="!isSelectable(index)"
          @click="selectStep(index)"
        >
          <span
            class="flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold transition-colors"
            :class="
              isComplete(index)
                ? 'border-blue-600 bg-blue-600 text-white'
                : isCurrent(index)
                  ? 'border-blue-600 bg-white text-blue-600 ring-2 ring-blue-500/25'
                  : 'border-slate-200 bg-slate-50 text-slate-400'
            "
          >
            <UIcon
              v-if="isComplete(index)"
              name="i-lucide-check"
              class="h-3.5 w-3.5"
            />
            <span v-else>{{ index + 1 }}</span>
          </span>

          <span
            class="hidden text-xs font-semibold whitespace-nowrap sm:block"
            :class="isCurrent(index) ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'"
          >
            {{ step.label }}
          </span>
        </button>

        <div
          v-if="index < steps.length - 1"
          class="h-0.5 flex-1 rounded-full"
          :class="isComplete(index + 1) ? 'bg-blue-500' : 'bg-slate-200'"
        />
      </template>
    </div>

    <p class="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 sm:hidden">
      <UIcon
        :name="steps[currentStep]?.icon ?? 'i-lucide-list-checks'"
        class="h-3.5 w-3.5 text-blue-500"
      />
      <span>
        Step {{ currentStep + 1 }} of {{ steps.length }} -
        {{ steps[currentStep]?.label }}
      </span>
    </p>
  </div>
</template>
