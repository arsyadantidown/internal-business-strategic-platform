<script setup lang="ts">
interface Props {
  placeholder?: string
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Write content...'
})

const model = defineModel<string>({ default: '' })

const toolbarItems = [
  [
    { 'kind': 'mark', 'mark': 'bold', 'icon': 'i-lucide-bold', 'aria-label': 'Bold' },
    { 'kind': 'mark', 'mark': 'italic', 'icon': 'i-lucide-italic', 'aria-label': 'Italic' },
    { 'kind': 'mark', 'mark': 'underline', 'icon': 'i-lucide-underline', 'aria-label': 'Underline' },
    { 'kind': 'mark', 'mark': 'strike', 'icon': 'i-lucide-strikethrough', 'aria-label': 'Strikethrough' }
  ],
  [
    { 'kind': 'heading', 'level': 2, 'icon': 'i-lucide-heading-2', 'aria-label': 'Heading 2' },
    { 'kind': 'heading', 'level': 3, 'icon': 'i-lucide-heading-3', 'aria-label': 'Heading 3' }
  ],
  [
    { 'kind': 'bulletList', 'icon': 'i-lucide-list', 'aria-label': 'Bullet list' },
    { 'kind': 'orderedList', 'icon': 'i-lucide-list-ordered', 'aria-label': 'Ordered list' },
    { 'kind': 'blockquote', 'icon': 'i-lucide-quote', 'aria-label': 'Blockquote' },
    { 'kind': 'link', 'icon': 'i-lucide-link', 'aria-label': 'Insert link' }
  ],
  [
    { 'kind': 'undo', 'icon': 'i-lucide-undo-2', 'aria-label': 'Undo' },
    { 'kind': 'redo', 'icon': 'i-lucide-redo-2', 'aria-label': 'Redo' },
    { 'kind': 'clearFormatting', 'icon': 'i-lucide-remove-formatting', 'aria-label': 'Clear formatting' }
  ]
]

const starterKit = {
  heading: { levels: [2, 3] as (2 | 3)[] },
  link: { openOnClick: false }
}
</script>

<template>
  <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
    <UEditor
      v-model="model"
      content-type="html"
      :starter-kit="starterKit"
      :placeholder="placeholder"
      :image="false"
      :mention="false"
      data-cms-rich-editor
    >
      <template #default="{ editor }">
        <UEditorToolbar
          :editor="editor"
          :items="toolbarItems"
          size="xs"
          class="flex flex-wrap items-center gap-0.5 border-b border-slate-100 bg-slate-50/70 px-1.5 py-1"
        />
      </template>
    </UEditor>
  </div>
</template>

<style scoped>
:deep([data-cms-rich-editor]) {
  min-height: 7rem;
  max-height: 16rem;
  overflow-y: auto;
  padding: 0.75rem;
  font-size: 0.75rem;
  line-height: 1.65;
  color: var(--color-slate-700);
}

:deep([data-cms-rich-editor]:focus) {
  outline: none;
}

:deep([data-cms-rich-editor] p) {
  margin: 0.35rem 0;
}

:deep([data-cms-rich-editor] h2) {
  margin: 0.6rem 0 0.35rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-slate-900);
}

:deep([data-cms-rich-editor] h3) {
  margin: 0.5rem 0 0.3rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-slate-900);
}

:deep([data-cms-rich-editor] ul) {
  margin: 0.35rem 0;
  padding-left: 1.1rem;
  list-style: disc;
}

:deep([data-cms-rich-editor] ol) {
  margin: 0.35rem 0;
  padding-left: 1.1rem;
  list-style: decimal;
}

:deep([data-cms-rich-editor] blockquote) {
  margin: 0.45rem 0;
  border-left: 2px solid var(--color-slate-300);
  padding-left: 0.75rem;
  color: var(--color-slate-500);
}

:deep([data-cms-rich-editor] a) {
  color: var(--color-blue-600);
  text-decoration: underline;
}

:deep([data-cms-rich-editor] p.is-editor-empty:first-child::before) {
  color: var(--color-slate-400);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
