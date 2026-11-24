<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { cmsControlClass, cmsControlStateClass } from '~/modules/cms/utils/cmsForm'
import { getPartnerErrorMessage } from '../../api/partner.api'
import { usePartnerStore } from '../../stores/partner.store'
import type { PartnerDetail, PartnerFormValues } from '../../types/partner.types'

interface Props {
  editingId: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'back' | 'saved'): void
}>()

const toast = useToast()
const partnerStore = usePartnerStore()

const isEditMode = computed(() => props.editingId !== null)

const detail = ref<PartnerDetail | null>(null)
const isPreparing = ref(true)
const prepareError = ref('')
const submitError = ref('')
const isSubmitting = ref(false)

const form = reactive<PartnerFormValues>({ partnerName: '' })

// Partner ID display formatter (e.g. PTR-89241 or raw ID)
const formattedPartnerId = computed(() => {
  if (!props.editingId) return ''
  // If it's a short/readable format or uuid, display cleanly
  return props.editingId.length > 8
    ? `PTR-${props.editingId.slice(0, 5).toUpperCase()}`
    : `PTR-${props.editingId}`
})

const clearInput = () => {
  form.partnerName = ''
  submitError.value = ''
}

const prepareForm = async () => {
  isPreparing.value = true
  prepareError.value = ''
  submitError.value = ''

  try {
    if (props.editingId) {
      const loaded = await partnerStore.fetchPartnerDetail(props.editingId)
      if (loaded) {
        detail.value = loaded
        form.partnerName = loaded.partnerName
      } else {
        prepareError.value = partnerStore.detailError || 'Failed to load partner detail.'
      }
    }
  } catch (error) {
    prepareError.value = getPartnerErrorMessage(error)
  } finally {
    isPreparing.value = false
  }
}

const validate = (): boolean => {
  const partnerName = form.partnerName.trim()

  if (!partnerName) {
    submitError.value = 'Partner name is required.'
    return false
  }

  if (partnerName.length > 200) {
    submitError.value = 'Partner name must be at most 200 characters.'
    return false
  }

  submitError.value = ''
  return true
}

const handleSubmit = async () => {
  if (isSubmitting.value || !validate()) return

  isSubmitting.value = true

  try {
    if (isEditMode.value && props.editingId && detail.value) {
      const changes = partnerStore.getUpdateChanges(detail.value, form)

      if (Object.keys(changes).length === 0) {
        toast.add({
          title: 'No changes to save',
          description: 'Nothing was modified on this partner.',
          color: 'warning'
        })
        return
      }

      await partnerStore.updatePartner(props.editingId, detail.value, form)

      toast.add({
        title: 'Partner updated',
        description: `"${form.partnerName.trim()}" has been updated successfully.`,
        color: 'success'
      })
    } else {
      await partnerStore.createPartner(form)

      toast.add({
        title: 'Partner added',
        description: `"${form.partnerName.trim()}" has been registered as a new partner.`,
        color: 'success'
      })
    }

    emit('saved')
  } catch (error) {
    const message = getPartnerErrorMessage(error)
    submitError.value = message

    toast.add({
      title: isEditMode.value ? 'Failed to update partner' : 'Failed to add partner',
      description: message,
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  prepareForm()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Top Bar: Back Button, Breadcrumb, and Status/ID Badge -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSubmitting"
          @click="emit('back')"
        >
          <UIcon name="i-lucide-arrow-left" class="h-4 w-4 text-slate-500" />
          <span>Back to directory</span>
        </button>

        <span class="text-slate-300">/</span>

        <!-- Breadcrumb Inline -->
        <nav class="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <span>Administration</span>
          <UIcon name="i-lucide-chevron-right" class="h-3 w-3 text-slate-300" />
          <span>Content Management</span>
          <UIcon name="i-lucide-chevron-right" class="h-3 w-3 text-slate-300" />
          <span>Partner</span>
          <UIcon name="i-lucide-chevron-right" class="h-3 w-3 text-slate-300" />
          <span class="font-bold text-slate-800">
            {{ isEditMode ? 'Edit' : 'Add' }}
          </span>
        </nav>
      </div>

      <!-- Partner ID Pill Badge (Edit Mode only) -->
      <div
        v-if="isEditMode && props.editingId"
        class="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3.5 py-1 text-xs text-slate-600 shadow-2xs"
      >
        <span
          class="h-2 w-2 rounded-full"
          :class="detail?.isActive ? 'bg-emerald-500' : 'bg-slate-400'"
        />
        <span
          >Partner ID:
          <strong class="font-semibold text-slate-800">{{ formattedPartnerId }}</strong></span
        >
      </div>
    </div>

    <!-- Title & Metadata -->
    <div>
      <div v-if="isEditMode" class="mb-1.5 flex items-center gap-2">
        <span
          class="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-600"
        >
          DIRECTORY ITEM
        </span>
        <span class="text-xs text-slate-400">• Last modified today at 09:42 AM</span>
      </div>

      <h1 class="text-2xl font-bold tracking-tight text-slate-900">
        {{ isEditMode ? 'Edit Partner' : 'Add Partner' }}
      </h1>
      <p class="mt-1 text-xs text-slate-500">
        {{
          isEditMode
            ? 'Update the partner name used across the directory.'
            : 'Register a new partner by providing its name.'
        }}
      </p>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="isPreparing" class="space-y-4">
      <div class="h-14 animate-pulse rounded-2xl bg-slate-100" />
      <div class="h-56 animate-pulse rounded-2xl bg-slate-100" />
    </div>

    <!-- Error State -->
    <div
      v-else-if="prepareError"
      class="rounded-2xl border border-slate-200/80 bg-white p-10 shadow-xs"
    >
      <div class="flex flex-col items-center gap-2.5 text-center">
        <UIcon name="i-lucide-circle-alert" class="h-8 w-8 text-rose-500" />
        <div>
          <p class="text-sm font-semibold text-slate-800">Failed to prepare the form</p>
          <p class="mt-1 text-xs text-slate-500">
            {{ prepareError }}
          </p>
        </div>
        <button
          type="button"
          class="mt-2 inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 cursor-pointer"
          @click="prepareForm"
        >
          <UIcon name="i-lucide-rotate-ccw" class="h-3.5 w-3.5" />
          <span>Retry</span>
        </button>
      </div>
    </div>

    <!-- Main Form Card -->
    <form
      v-else
      novalidate
      class="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xs"
      @submit.prevent="handleSubmit"
    >
      <!-- Section Header -->
      <div class="flex items-start gap-3.5">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"
        >
          <UIcon name="i-lucide-building-2" class="h-6 w-6" />
        </div>
        <div class="min-w-0">
          <h2 class="text-base font-bold text-slate-900">Partner Information</h2>
          <p class="mt-0.5 text-xs text-slate-500">Enter the name of the partner organization</p>
        </div>
      </div>

      <!-- Field Input -->
      <div class="mt-8">
        <div class="mb-2 flex items-center justify-between">
          <label for="partner-name" class="text-xs font-semibold text-slate-800">
            Partner Name <span class="text-rose-500">*</span>
          </label>
          <span class="text-xs text-slate-400"> {{ form.partnerName.length }} / 200 </span>
        </div>

        <div class="relative">
          <input
            id="partner-name"
            v-model="form.partnerName"
            type="text"
            maxlength="200"
            placeholder="e.g. PT Maju Teknologi Nusantara"
            autocomplete="organization"
            :class="[
              cmsControlClass,
              cmsControlStateClass(!!submitError),
              'h-11 px-3.5 pr-10 text-xs text-slate-800'
            ]"
            :disabled="isSubmitting"
            @input="submitError = ''"
          />
          <!-- Clear Button (X icon) -->
          <button
            v-if="form.partnerName && !isSubmitting"
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            @click="clearInput"
          >
            <UIcon name="i-lucide-circle-x" class="h-4 w-4" />
          </button>
        </div>

        <p
          v-if="submitError"
          class="mt-2 flex items-center gap-1 text-xs font-medium text-rose-600"
        >
          <UIcon name="i-lucide-info" class="h-3.5 w-3.5" />
          <span>{{ submitError }}</span>
        </p>
        <p v-else class="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <UIcon name="i-lucide-info" class="h-3.5 w-3.5 text-slate-400" />
          <span>Required. Maximum 200 characters.</span>
        </p>
      </div>

      <!-- Footer Actions -->
      <div class="mt-10 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          class="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSubmitting"
          @click="emit('back')"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSubmitting"
        >
          <UIcon v-if="isSubmitting" name="i-lucide-loader-2" class="h-4 w-4 animate-spin" />
          <UIcon v-else name="i-lucide-check" class="h-4 w-4" />
          <span>{{ isSubmitting ? 'Saving...' : 'Save Partner' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
