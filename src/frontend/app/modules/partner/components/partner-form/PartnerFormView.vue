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
  <div class="space-y-5">
    <button
      type="button"
      class="inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
      :disabled="isSubmitting"
      @click="emit('back')"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="h-3.5 w-3.5"
      />
      <span>Back to directory</span>
    </button>

    <div>
      <nav class="flex flex-wrap items-center gap-1 text-[11px] font-medium text-slate-400">
        <span>Administration</span>
        <UIcon
          name="i-lucide-chevron-right"
          class="h-3 w-3"
        />
        <span>Content Management</span>
        <UIcon
          name="i-lucide-chevron-right"
          class="h-3 w-3"
        />
        <span>Partner</span>
        <UIcon
          name="i-lucide-chevron-right"
          class="h-3 w-3"
        />
        <span class="font-semibold text-slate-700">
          {{ isEditMode ? 'Edit' : 'Add' }}
        </span>
      </nav>
      <h1 class="mt-2 text-xl font-bold leading-7 tracking-tight text-slate-900">
        {{ isEditMode ? 'Edit Partner' : 'Add Partner' }}
      </h1>
      <p class="mt-0.5 max-w-2xl text-xs leading-5 text-slate-500">
        {{ isEditMode
          ? 'Update the partner name used across the directory.'
          : 'Register a new partner by providing its name.' }}
      </p>
    </div>

    <div
      v-if="isPreparing"
      class="space-y-4"
    >
      <div class="h-14 animate-pulse rounded-xl bg-slate-100" />
      <div class="h-52 animate-pulse rounded-xl bg-slate-100" />
    </div>

    <div
      v-else-if="prepareError"
      class="rounded-xl border border-slate-200/80 bg-white p-10 shadow-xs"
    >
      <div class="flex flex-col items-center gap-2.5 text-center">
        <UIcon
          name="i-lucide-circle-alert"
          class="h-8 w-8 text-red-400"
        />
        <div>
          <p class="text-xs font-semibold text-slate-700">
            Failed to prepare the form
          </p>
          <p class="mt-0.5 max-w-md text-[11px] text-slate-500">
            {{ prepareError }}
          </p>
        </div>
        <button
          type="button"
          class="mt-1 inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 cursor-pointer"
          @click="prepareForm"
        >
          <UIcon
            name="i-lucide-rotate-ccw"
            class="h-3.5 w-3.5"
          />
          <span>Retry</span>
        </button>
      </div>
    </div>

    <form
      v-else
      novalidate
      class="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs"
      @submit.prevent="handleSubmit"
    >
      <div class="flex items-start gap-2.5 border-b border-slate-100 p-4">
        <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <UIcon
            name="i-lucide-handshake"
            class="h-3.5 w-3.5"
          />
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-xs font-bold tracking-tight text-slate-900">
            Partner Information
          </h2>
          <p class="mt-0.5 text-[10px] text-slate-400">
            Enter the name of the partner organization
          </p>
        </div>
      </div>

      <div class="p-4">
        <label
          for="partner-name"
          class="mb-1.5 block text-[11px] font-semibold text-slate-700"
        >
          Partner Name <span class="text-rose-500">*</span>
        </label>
        <input
          id="partner-name"
          v-model="form.partnerName"
          type="text"
          maxlength="200"
          placeholder="e.g. PT Maju Teknologi Nusantara"
          autocomplete="organization"
          :class="[cmsControlClass, cmsControlStateClass(!!submitError)]"
          :disabled="isSubmitting"
          @input="submitError = ''"
        >
        <p
          v-if="submitError"
          class="mt-1 text-[10px] font-medium text-rose-600"
        >
          {{ submitError }}
        </p>
        <p
          v-else
          class="mt-1 text-[10px] font-medium text-slate-400"
        >
          Required. Maximum 200 characters.
        </p>
      </div>

      <div class="flex items-center justify-end gap-2.5 border-t border-slate-100 p-4">
        <button
          type="button"
          class="inline-flex h-8.5 items-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 shadow-xs transition-all hover:bg-slate-50 hover:text-slate-800 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSubmitting"
          @click="emit('back')"
        >
          Cancel
        </button>

        <button
          type="submit"
          class="inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isSubmitting"
        >
          <UIcon
            v-if="isSubmitting"
            name="i-lucide-loader-2"
            class="h-3.5 w-3.5 animate-spin"
          />
          <UIcon
            v-else
            name="i-lucide-circle-check-big"
            class="h-3.5 w-3.5"
          />
          <span>{{ isSubmitting ? 'Saving...' : 'Save Partner' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
