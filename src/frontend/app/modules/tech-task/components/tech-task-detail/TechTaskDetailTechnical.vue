<script setup lang="ts">
import type { TechTaskDetail } from '../../types/tech-task.types'

defineProps<{
  detail: TechTaskDetail
}>()

interface ContentBlock {
  key: string
  icon: string
  title: string
  description: string
  value: string | null
}

const blocks = (
  detail: TechTaskDetail
): ContentBlock[] =>
  [
    {
      key: 'objective',
      icon: 'i-lucide-target',
      title: 'Objective',
      description: 'Goal the technical work delivers',
      value: detail.projectObjective
    },
    {
      key: 'description',
      icon: 'i-lucide-file-text',
      title: 'Work Description',
      description: 'Scope of the technical work performed',
      value: detail.projectDescription
    },
    {
      key: 'background',
      icon: 'i-lucide-layers',
      title: 'Background',
      description: 'Context behind the engagement',
      value: detail.projectBackground
    },
    {
      key: 'challenges',
      icon: 'i-lucide-flag',
      title: 'Technical Requirements',
      description: 'Needs and challenges to solve',
      value: detail.projectChallenges
    },
    {
      key: 'solution',
      icon: 'i-lucide-lightbulb',
      title: 'Technical Solution',
      description: 'Approach implemented to address the requirements',
      value: detail.projectSolution
    }
  ]
</script>

<template>
  <section class="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
    <div class="flex items-start gap-2.5 border-b border-slate-100 pb-2.5">
      <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <UIcon
          name="i-lucide-clipboard-list"
          class="h-3.5 w-3.5"
        />
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="text-xs font-bold tracking-tight text-slate-900">
          Technical Work Information
        </h3>
        <p class="mt-0.5 text-[10px] text-slate-400">
          Requirements, solutions, and narrative of the engagement
        </p>
      </div>
    </div>

    <div class="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
      <article
        v-for="block in blocks(detail)"
        :key="block.key"
        class="flex flex-col rounded-lg border border-slate-100 bg-slate-50/70 p-3.5"
        :class="block.key === 'challenges' || block.key === 'solution' ? 'xl:col-span-2' : ''"
      >
        <div class="flex items-center gap-2">
          <UIcon
            :name="block.icon"
            class="h-3.5 w-3.5 text-slate-500"
          />
          <h4 class="text-[11px] font-bold text-slate-700">
            {{ block.title }}
          </h4>
        </div>
        <p class="mt-0.5 text-[10px] font-medium text-slate-400">
          {{ block.description }}
        </p>
        <p
          v-if="block.value"
          class="mt-2 flex-1 text-xs leading-5 whitespace-pre-line text-slate-600"
        >
          {{ block.value }}
        </p>
        <p
          v-else
          class="mt-2 flex-1 text-xs italic text-slate-400"
        >
          Not documented yet.
        </p>
      </article>
    </div>
  </section>
</template>
