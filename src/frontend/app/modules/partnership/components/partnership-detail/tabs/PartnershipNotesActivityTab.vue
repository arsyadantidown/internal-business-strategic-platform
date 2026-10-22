<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

type NoteTag = 'Follow Up' | 'Strategic' | 'Legal' | 'Meeting' | 'Positive' | 'Urgent' | 'General'

type ActivityCategory
  = | 'General'
    | 'Notes'
    | 'Documents'
    | 'Meetings'
    | 'Evaluations'
    | 'Portfolios'
    | 'Status'

type ActivityAccent = 'blue' | 'purple' | 'green' | 'orange'

type NoteModalMode = 'create' | 'edit' | 'view' | 'delete'

interface InternalNote {
  id: string
  author: string
  role: string
  initials: string
  timestamp: string
  title: string
  description: string
  tags: NoteTag[]
}

interface ActivityItem {
  id: string
  title: string
  description: string
  timestamp: string
  actor: string
  initials: string
  category: ActivityCategory
  icon: string
  accent: ActivityAccent
}

interface NoteMenuItem {
  label: string
  icon: string
  color?: 'error'
  onSelect: () => void
}

// 1. Current user (dummy lokal, backend belum tersedia)
const currentUser = {
  name: 'Roland Brilianto',
  role: 'Administrator',
  initials: 'RB'
}

// 2. Internal Notes Mock Data
const notes = ref<InternalNote[]>([
  {
    id: 'NOTE-2026-003',
    author: 'Roland Brilianto',
    role: 'Administrator',
    initials: 'RB',
    timestamp: 'Oct 10, 2026 14:32',
    title: 'Follow up on Q4 collaboration',
    description:
      'Need to schedule a meeting with Astra team to discuss the Q4 collaboration plan. Focus on expanding the EV portfolio and potential joint marketing campaign.',
    tags: ['Follow Up', 'Strategic']
  },
  {
    id: 'NOTE-2026-002',
    author: 'Siti Nurhaliza',
    role: 'Partnership Manager',
    initials: 'SN',
    timestamp: 'Sep 28, 2026 10:15',
    title: 'Legal document review',
    description:
      'All legal documents have been reviewed by the legal team. Only waiting for the signed MoU from their side.',
    tags: ['Legal']
  },
  {
    id: 'NOTE-2026-001',
    author: 'Ahmad Dwi',
    role: 'Business Development',
    initials: 'AD',
    timestamp: 'Sep 12, 2026 16:20',
    title: 'Initial discussion',
    description:
      'Had a productive initial discussion with Astra team. They are very interested in our platform and see potential for long-term collaboration.',
    tags: ['Meeting', 'Positive']
  }
])

// 3. Activity Timeline Mock Data
const activities: ActivityItem[] = [
  {
    id: 'ACT-007',
    title: 'Partnership details updated',
    description: 'Updated partnership end date from Dec 31, 2026 to Dec 31, 2027.',
    timestamp: 'Oct 10, 2026 14:32',
    actor: 'Roland Brilianto',
    initials: 'RB',
    category: 'General',
    icon: 'i-lucide-pencil',
    accent: 'blue'
  },
  {
    id: 'ACT-006',
    title: 'Note added',
    description: 'Added a new internal note: "Follow up on Q4 collaboration".',
    timestamp: 'Oct 10, 2026 14:32',
    actor: 'Roland Brilianto',
    initials: 'RB',
    category: 'Notes',
    icon: 'i-lucide-sticky-note',
    accent: 'purple'
  },
  {
    id: 'ACT-005',
    title: 'Legal document uploaded',
    description: 'Uploaded file "MoU Draft v2.pdf" to Legal Documents.',
    timestamp: 'Sep 28, 2026 10:15',
    actor: 'Siti Nurhaliza',
    initials: 'SN',
    category: 'Documents',
    icon: 'i-lucide-upload',
    accent: 'green'
  },
  {
    id: 'ACT-004',
    title: 'Meeting recorded',
    description: 'Added meeting record for "Initial Partnership Discussion".',
    timestamp: 'Sep 12, 2026 16:20',
    actor: 'Ahmad Dwi',
    initials: 'AD',
    category: 'Meetings',
    icon: 'i-lucide-calendar-check',
    accent: 'orange'
  },
  {
    id: 'ACT-003',
    title: 'Evaluation updated',
    description: 'Updated performance evaluation for Q3 2026.',
    timestamp: 'Sep 05, 2026 11:08',
    actor: 'Siti Nurhaliza',
    initials: 'SN',
    category: 'Evaluations',
    icon: 'i-lucide-clipboard-check',
    accent: 'blue'
  },
  {
    id: 'ACT-002',
    title: 'Related portfolio added',
    description: 'Linked portfolio "Astra EV Charging Station".',
    timestamp: 'Aug 20, 2026 09:45',
    actor: 'Ahmad Dwi',
    initials: 'AD',
    category: 'Portfolios',
    icon: 'i-lucide-link',
    accent: 'green'
  },
  {
    id: 'ACT-001',
    title: 'Status changed',
    description: 'Changed partnership status from "Pending" to "Active".',
    timestamp: 'Aug 15, 2026 13:22',
    actor: 'Roland Brilianto',
    initials: 'RB',
    category: 'Status',
    icon: 'i-lucide-refresh-cw',
    accent: 'orange'
  }
]

// 4. Helper Styles
const noteTagClass: Record<NoteTag, string> = {
  'Follow Up': 'bg-amber-50 text-amber-700 border-amber-200',
  'Strategic': 'bg-purple-50 text-purple-700 border-purple-200',
  'Legal': 'bg-blue-50 text-blue-700 border-blue-200',
  'Meeting': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Positive': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Urgent': 'bg-red-50 text-red-700 border-red-200',
  'General': 'bg-slate-50 text-slate-700 border-slate-200'
}

const accentIconClass: Record<ActivityAccent, string> = {
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  green: 'bg-emerald-50 text-emerald-600',
  orange: 'bg-orange-50 text-orange-600'
}

const availableNoteTags: NoteTag[] = [
  'Follow Up',
  'Strategic',
  'Legal',
  'Meeting',
  'Positive',
  'Urgent',
  'General'
]

// 5. Activity Filter
const activityFilterOptions: { value: string, label: string }[] = [
  { value: '', label: 'All Activities' },
  { value: 'General', label: 'General Updates' },
  { value: 'Notes', label: 'Notes' },
  { value: 'Documents', label: 'Documents' },
  { value: 'Meetings', label: 'Meetings' },
  { value: 'Evaluations', label: 'Evaluations' },
  { value: 'Portfolios', label: 'Portfolios' },
  { value: 'Status', label: 'Status Changes' }
]

const activityFilter = ref('')

const filteredActivities = computed(() =>
  !activityFilter.value
    ? activities
    : activities.filter(activity => activity.category === activityFilter.value)
)

const isActivityFiltered = computed(() => Boolean(activityFilter.value))

const resetActivityFilter = () => {
  activityFilter.value = ''
}

// 6. Note Dialog State
const isNoteModalOpen = ref(false)
const noteModalMode = ref<NoteModalMode>('create')
const activeNoteId = ref<string | null>(null)

const noteForm = reactive<{ title: string, description: string, tags: NoteTag[] }>({
  title: '',
  description: '',
  tags: []
})

const activeNote = computed(
  () => notes.value.find(note => note.id === activeNoteId.value) ?? null
)

const noteModalTitle = computed(() => {
  switch (noteModalMode.value) {
    case 'create':
      return 'Add Internal Note'
    case 'edit':
      return 'Edit Internal Note'
    case 'view':
      return 'Note Details'
    case 'delete':
      return 'Delete Note'
    default:
      return 'Internal Note'
  }
})

const toast = useToast()

// 7. Timestamp Helper
const monthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

const formatTimestamp = (date: Date) => {
  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')

  return `${monthLabels[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${hours}:${minutes}`
}

// 8. Note Actions
const resetNoteForm = () => {
  noteForm.title = ''
  noteForm.description = ''
  noteForm.tags = []
}

const openCreateNote = () => {
  resetNoteForm()
  activeNoteId.value = null
  noteModalMode.value = 'create'
  isNoteModalOpen.value = true
}

const openViewNote = (note: InternalNote) => {
  resetNoteForm()
  activeNoteId.value = note.id
  noteModalMode.value = 'view'
  isNoteModalOpen.value = true
}

const openEditNote = (note: InternalNote) => {
  resetNoteForm()
  activeNoteId.value = note.id
  noteForm.title = note.title
  noteForm.description = note.description
  noteForm.tags = [...note.tags]
  noteModalMode.value = 'edit'
  isNoteModalOpen.value = true
}

const openDeleteNote = (note: InternalNote) => {
  resetNoteForm()
  activeNoteId.value = note.id
  noteModalMode.value = 'delete'
  isNoteModalOpen.value = true
}

const closeNoteModal = () => {
  isNoteModalOpen.value = false
  activeNoteId.value = null
  resetNoteForm()
}

const toggleNoteTag = (tag: NoteTag) => {
  const index = noteForm.tags.indexOf(tag)

  if (index === -1) {
    noteForm.tags.push(tag)
    return
  }

  noteForm.tags.splice(index, 1)
}

const saveNote = () => {
  const title = noteForm.title.trim()
  const description = noteForm.description.trim()

  if (!title || !description) {
    toast.add({
      title: 'Incomplete note',
      description: 'Title and description are required to save a note.',
      color: 'error'
    })
    return
  }

  const tags: NoteTag[] = noteForm.tags.length ? [...noteForm.tags] : ['General']

  if (noteModalMode.value === 'edit') {
    const note = notes.value.find(item => item.id === activeNoteId.value)

    if (note) {
      note.title = title
      note.description = description
      note.tags = tags
    }

    toast.add({
      title: 'Note updated',
      description: `"${title}" has been updated.`,
      color: 'success'
    })
  } else {
    notes.value.unshift({
      id: `NOTE-${Date.now()}`,
      author: currentUser.name,
      role: currentUser.role,
      initials: currentUser.initials,
      timestamp: formatTimestamp(new Date()),
      title,
      description,
      tags
    })

    toast.add({
      title: 'Note added',
      description: `"${title}" has been added to internal notes.`,
      color: 'success'
    })
  }

  closeNoteModal()
}

const confirmDeleteNote = () => {
  const note = activeNote.value

  if (!note) {
    closeNoteModal()
    return
  }

  notes.value = notes.value.filter(item => item.id !== note.id)

  toast.add({
    title: 'Note deleted',
    description: `"${note.title}" has been removed from internal notes.`,
    color: 'error'
  })

  closeNoteModal()
}

const copyNote = async (note: InternalNote) => {
  const content = `${note.title}\n\n${note.description}\n\n— ${note.author} (${note.initials}), ${note.timestamp}`

  try {
    await navigator.clipboard.writeText(content)
    toast.add({
      title: 'Note copied',
      description: `"${note.title}" has been copied to the clipboard.`,
      color: 'success'
    })
  } catch {
    toast.add({
      title: 'Copy failed',
      description: 'Clipboard access is not available in this browser.',
      color: 'warning'
    })
  }
}

// 9. Dropdown Menu
const noteMenuItems = (note: InternalNote): NoteMenuItem[][] => [
  [
    {
      label: 'View Note',
      icon: 'i-lucide-eye',
      onSelect: () => openViewNote(note)
    },
    {
      label: 'Edit Note',
      icon: 'i-lucide-pencil',
      onSelect: () => openEditNote(note)
    }
  ],
  [
    {
      label: 'Copy Note',
      icon: 'i-lucide-copy',
      onSelect: () => copyNote(note)
    }
  ],
  [
    {
      label: 'Delete Note',
      icon: 'i-lucide-trash-2',
      color: 'error',
      onSelect: () => openDeleteNote(note)
    }
  ]
]

// 10. Keyboard Handler (Escape untuk menutup dialog)
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isNoteModalOpen.value) {
    closeNoteModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="grid grid-cols-1 items-start gap-5 lg:grid-cols-[52fr_48fr]">
    <!-- 1. Panel Kiri: Internal Notes (52%) -->
    <section class="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
      <div
        class="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div class="flex min-w-0 items-start gap-2.5">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"
          >
            <UIcon
              name="i-lucide-file-text"
              class="h-5 w-5"
            />
          </div>
          <div class="min-w-0">
            <h2 class="text-base font-semibold tracking-tight text-slate-900">
              Internal Notes
            </h2>
            <p class="mt-1 text-[13px] leading-relaxed text-slate-500">
              Add and manage internal notes related to this partner. These notes are only visible
              to authorized users.
            </p>
          </div>
        </div>

        <button
          type="button"
          class="inline-flex h-10 shrink-0 items-center gap-1.5 self-start rounded-lg bg-blue-600 px-3.5 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-blue-700 cursor-pointer"
          @click="openCreateNote"
        >
          <UIcon
            name="i-lucide-plus"
            class="h-4 w-4"
          />
          <span>Add Note</span>
        </button>
      </div>

      <div class="mt-4 flex min-w-0 flex-col gap-3">
        <article
          v-for="note in notes"
          :key="note.id"
          class="min-w-0 rounded-xl border border-slate-200/80 bg-white p-3.5 transition-colors hover:border-slate-300 hover:bg-slate-50/50"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600"
              >
                {{ note.initials }}
              </div>
              <div class="min-w-0">
                <p class="truncate text-[13px] font-semibold text-slate-800">
                  {{ note.author }}
                </p>
                <p class="truncate text-xs text-slate-400">
                  {{ note.role }}
                </p>
              </div>
            </div>

            <div class="flex shrink-0 items-center gap-1.5">
              <span class="text-xs whitespace-nowrap text-slate-400">
                {{ note.timestamp }}
              </span>

              <UDropdownMenu
                :items="noteMenuItems(note)"
                :content="{ align: 'end' }"
              >
                <button
                  type="button"
                  class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                  aria-label="Note actions"
                >
                  <UIcon
                    name="i-lucide-ellipsis-vertical"
                    class="h-4 w-4"
                  />
                </button>
              </UDropdownMenu>
            </div>
          </div>

          <h3 class="mt-3 text-sm font-semibold text-slate-900">
            {{ note.title }}
          </h3>
          <p class="mt-1.5 text-[13px] leading-relaxed text-slate-600">
            {{ note.description }}
          </p>

          <div class="mt-2.5 flex flex-wrap items-center gap-2">
            <span
              v-for="tag in note.tags"
              :key="tag"
              class="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] leading-4 font-semibold"
              :class="noteTagClass[tag]"
            >
              {{ tag }}
            </span>
          </div>
        </article>

        <div
          v-if="notes.length === 0"
          class="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center"
        >
          <UIcon
            name="i-lucide-notebook-pen"
            class="mx-auto h-6 w-6 text-slate-300"
          />
          <p class="mt-2 text-[13px] font-semibold text-slate-600">
            No internal notes yet
          </p>
          <p class="mt-1 text-xs text-slate-400">
            Use the "Add Note" button to create the first note.
          </p>
        </div>
      </div>
    </section>

    <!-- 2. Panel Kanan: Activity Timeline (48%) -->
    <section class="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
      <div
        class="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div class="flex min-w-0 items-start gap-2.5">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"
          >
            <UIcon
              name="i-lucide-clock"
              class="h-5 w-5"
            />
          </div>
          <div class="min-w-0">
            <h2 class="text-base font-semibold tracking-tight text-slate-900">
              Activity Timeline
            </h2>
            <p class="mt-1 text-[13px] leading-relaxed text-slate-500">
              Track all activities and changes related to this partner.
            </p>
          </div>
        </div>

        <div class="relative w-full shrink-0 sm:w-44">
          <select
            v-model="activityFilter"
            class="h-10 w-full min-w-0 appearance-none rounded-lg border border-slate-200 bg-white pr-8 pl-3 text-[13px] font-medium text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            <option
              v-for="option in activityFilterOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <UIcon
            name="i-lucide-chevron-down"
            class="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>

      <ol class="mt-5 min-w-0">
        <li
          v-for="(activity, index) in filteredActivities"
          :key="activity.id"
          class="relative flex gap-3 pb-5 last:pb-0"
        >
          <span
            v-if="index !== filteredActivities.length - 1"
            class="absolute top-8 -bottom-3 left-[17px] w-px bg-slate-200"
            aria-hidden="true"
          />

          <div
            class="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-2xs"
            :class="accentIconClass[activity.accent]"
          >
            <UIcon
              :name="activity.icon"
              class="h-4 w-4"
            />
          </div>

          <div class="min-w-0 flex-1 pt-0.5">
            <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <h3 class="text-[13px] font-semibold text-slate-900">
                {{ activity.title }}
              </h3>
              <span class="ml-auto shrink-0 text-xs whitespace-nowrap text-slate-400">
                {{ activity.timestamp }}
              </span>
            </div>

            <p class="mt-1 text-[13px] leading-relaxed text-slate-600">
              {{ activity.description }}
            </p>

            <div class="mt-2 flex items-center gap-2">
              <div
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600"
              >
                {{ activity.initials }}
              </div>
              <span class="truncate text-xs text-slate-500">
                {{ activity.actor }} ({{ activity.initials }})
              </span>
            </div>
          </div>
        </li>

        <li
          v-if="filteredActivities.length === 0"
          class="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center"
        >
          <UIcon
            name="i-lucide-search-x"
            class="mx-auto h-6 w-6 text-slate-300"
          />
          <p class="mt-2 text-[13px] font-semibold text-slate-600">
            No activities found
          </p>
          <p class="mt-1 text-xs text-slate-400">
            There is no activity for the selected filter.
          </p>
          <button
            type="button"
            class="mt-3 inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 cursor-pointer"
            @click="resetActivityFilter"
          >
            <UIcon
              name="i-lucide-refresh-cw"
              class="h-3.5 w-3.5"
            />
            <span>Show All Activities</span>
          </button>
        </li>
      </ol>

      <div
        v-if="isActivityFiltered"
        class="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500"
      >
        Showing
        <span class="font-semibold text-slate-700">{{ filteredActivities.length }}</span>
        of
        <span class="font-semibold text-slate-700">{{ activities.length }}</span>
        activities
      </div>
    </section>

    <!-- 3. Note Dialog (Add / Edit / View / Delete) -->
    <Teleport to="body">
      <div
        v-if="isNoteModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-dialog-title"
        @click.self="closeNoteModal"
      >
        <div
          class="fixed inset-0 bg-slate-900/40"
          @click="closeNoteModal"
        />

        <div class="relative z-10 w-full max-w-lg rounded-xl border border-slate-200/80 bg-white shadow-lg">
          <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3
              id="note-dialog-title"
              class="text-base font-semibold tracking-tight text-slate-900"
            >
              {{ noteModalTitle }}
            </h3>
            <button
              type="button"
              class="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              aria-label="Close dialog"
              @click="closeNoteModal"
            >
              <UIcon
                name="i-lucide-x"
                class="h-4 w-4"
              />
            </button>
          </div>

          <!-- Mode: Create & Edit -->
          <div
            v-if="noteModalMode === 'create' || noteModalMode === 'edit'"
            class="space-y-3 px-4 py-4"
          >
            <div>
              <label
                for="note-title"
                class="text-[13px] font-semibold text-slate-700"
              >
                Title
              </label>
              <input
                id="note-title"
                v-model="noteForm.title"
                type="text"
                placeholder="e.g. Follow up on Q4 collaboration"
                class="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 placeholder-slate-400 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
            </div>

            <div>
              <label
                for="note-description"
                class="text-[13px] font-semibold text-slate-700"
              >
                Description
              </label>
              <textarea
                id="note-description"
                v-model="noteForm.description"
                rows="4"
                placeholder="Describe the internal note..."
                class="mt-1 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] leading-relaxed text-slate-800 placeholder-slate-400 transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <p class="text-[13px] font-semibold text-slate-700">
                Tags
              </p>
              <div class="mt-1.5 flex flex-wrap gap-1.5">
                <button
                  v-for="tag in availableNoteTags"
                  :key="tag"
                  type="button"
                  class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer"
                  :class="
                    noteForm.tags.includes(tag)
                      ? noteTagClass[tag]
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  "
                  @click="toggleNoteTag(tag)"
                >
                  <UIcon
                    v-if="noteForm.tags.includes(tag)"
                    name="i-lucide-check"
                    class="h-3 w-3"
                  />
                  <span>{{ tag }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Mode: View -->
          <div
            v-else-if="noteModalMode === 'view' && activeNote"
            class="space-y-3 px-4 py-4"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600"
              >
                {{ activeNote.initials }}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-slate-900">
                  {{ activeNote.author }}
                </p>
                <p class="text-xs text-slate-400">
                  {{ activeNote.role }} · {{ activeNote.timestamp }}
                </p>
              </div>
            </div>

            <div>
              <p class="text-sm font-semibold text-slate-900">
                {{ activeNote.title }}
              </p>
              <p class="mt-1.5 rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-[13px] leading-relaxed text-slate-600">
                {{ activeNote.description }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <span
                v-for="tag in activeNote.tags"
                :key="tag"
                class="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] leading-4 font-semibold"
                :class="noteTagClass[tag]"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Mode: Delete -->
          <div
            v-else-if="noteModalMode === 'delete' && activeNote"
            class="px-4 py-4"
          >
            <div class="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50/70 p-3">
              <UIcon
                name="i-lucide-triangle-alert"
                class="mt-0.5 h-4 w-4 shrink-0 text-red-500"
              />
              <p class="text-[13px] leading-relaxed text-red-700">
                Are you sure you want to delete the note
                "<span class="font-semibold">{{ activeNote.title }}</span>"? This action cannot be
                undone.
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-2 border-t border-slate-100 px-4 py-3">
            <button
              type="button"
              class="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 cursor-pointer"
              @click="closeNoteModal"
            >
              <span>{{ noteModalMode === 'view' ? 'Close' : 'Cancel' }}</span>
            </button>

            <button
              v-if="noteModalMode === 'create' || noteModalMode === 'edit'"
              type="button"
              class="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-blue-700 cursor-pointer"
              @click="saveNote"
            >
              <UIcon
                name="i-lucide-check"
                class="h-4 w-4"
              />
              <span>{{ noteModalMode === 'edit' ? 'Save Changes' : 'Add Note' }}</span>
            </button>

            <button
              v-if="noteModalMode === 'delete'"
              type="button"
              class="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-600 px-4 text-[13px] font-semibold text-white shadow-2xs transition-colors hover:bg-red-700 cursor-pointer"
              @click="confirmDeleteNote"
            >
              <UIcon
                name="i-lucide-trash-2"
                class="h-4 w-4"
              />
              <span>Delete Note</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
