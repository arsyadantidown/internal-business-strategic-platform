<script setup lang="ts">
import { computed, ref } from 'vue'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', payload: any): void
}>()

const toast = useToast()

const isOpen = ref(false)
const currentStep = ref(0)

const steps = [
  { title: 'Profil Perusahaan', description: 'Data perusahaan mitra' },
  { title: 'Bidang Keahlian', description: 'Keahlian dan solusi' },
  { title: 'Berkas Legalitas', description: 'Dokumen legalitas' },
  { title: 'Review & Submit', description: 'Tinjau dan kirim' }
]

const form = ref({
  companyName: '',
  category: '',
  partnerType: '',
  industry: '',
  location: '',
  website: '',
  expertise: [] as string[],
  solutions: '',
  legalDocs: [] as Array<{
    name: string
    type: string
    issueDate: string
    expiryDate: string
  }>
})

const newDoc = ref({
  name: '',
  type: '',
  issueDate: '',
  expiryDate: ''
})

const categoryOptions = [
  { label: 'Technology Partner', value: 'Technology Partner' },
  { label: 'Channel Partner', value: 'Channel Partner' },
  { label: 'Service Partner', value: 'Service Partner' },
  { label: 'Marketing Partner', value: 'Marketing Partner' }
]

const partnerTypeOptions = [
  { label: 'Strategic Partner', value: 'Strategic Partner' },
  { label: 'Implementation Partner', value: 'Implementation Partner' },
  { label: 'Consulting Partner', value: 'Consulting Partner' },
  { label: 'Reseller', value: 'Reseller' },
  { label: 'Technology Provider', value: 'Technology Provider' },
  { label: 'Other', value: 'Other' }
]

const industryOptions = [
  { label: 'Financial Services', value: 'Financial Services' },
  { label: 'Manufacturing', value: 'Manufacturing' },
  { label: 'Retail and Wholesale Trade', value: 'Retail and Wholesale Trade' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'Government', value: 'Government' },
  { label: 'Information Technology (IT) and Software', value: 'Information Technology (IT) and Software' },
  { label: 'Telecommunications', value: 'Telecommunications' },
  { label: 'Transportation and Logistics', value: 'Transportation and Logistics' }
]

const locationOptions = [
  { label: 'Jakarta, Indonesia', value: 'Jakarta, Indonesia' },
  { label: 'Bandung, Indonesia', value: 'Bandung, Indonesia' },
  { label: 'Surabaya, Indonesia', value: 'Surabaya, Indonesia' },
  { label: 'Singapore', value: 'Singapore' }
]

const expertiseOptions = [
  { label: 'Cloud Platform', value: 'Cloud Platform' },
  { label: 'Data Analytics', value: 'Data Analytics' },
  { label: 'AI & Machine Learning', value: 'AI & Machine Learning' },
  { label: 'Network Solution', value: 'Network Solution' },
  { label: 'IoT Solution', value: 'IoT Solution' },
  { label: 'Cybersecurity', value: 'Cybersecurity' },
  { label: 'Digital Transformation', value: 'Digital Transformation' },
  { label: 'Business Consulting', value: 'Business Consulting' },
  { label: 'Industrial Automation', value: 'Industrial Automation' },
  { label: 'System Integration', value: 'System Integration' }
]

const docTypeOptions = [
  { label: 'Akta Pendirian', value: 'Akta Pendirian' },
  { label: 'NPWP', value: 'NPWP' },
  { label: 'SIUP/TDP/NIB', value: 'SIUP/TDP/NIB' },
  { label: 'Sertifikasi', value: 'Sertifikasi' },
  { label: 'Lainnya', value: 'Lainnya' }
]

const stepValid = computed(() => {
  if (currentStep.value === 0) {
    return !!(form.value.companyName && form.value.category && form.value.partnerType && form.value.industry && form.value.location)
  }
  if (currentStep.value === 1) {
    return form.value.expertise.length > 0
  }
  if (currentStep.value === 2) {
    return true
  }
  if (currentStep.value === 3) {
    return true
  }
  return false
})

const addDocument = () => {
  if (!newDoc.value.name || !newDoc.value.type) return
  form.value.legalDocs.push({ ...newDoc.value })
  newDoc.value = { name: '', type: '', issueDate: '', expiryDate: '' }
}

const removeDocument = (index: number) => {
  form.value.legalDocs.splice(index, 1)
}

const nextStep = () => {
  if (!stepValid.value) {
    toast.add({ title: 'Validasi', description: 'Lengkapi field wajib pada langkah ini.', color: 'warning' })
    return
  }
  if (currentStep.value < steps.length - 1) currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 0) currentStep.value--
}

const open = () => {
  isOpen.value = true
  currentStep.value = 0
  form.value = {
    companyName: '',
    category: '',
    partnerType: '',
    industry: '',
    location: '',
    website: '',
    expertise: [],
    solutions: '',
    legalDocs: []
  }
}

const close = () => {
  isOpen.value = false
  emit('close')
}

const saveDraft = () => {
  emit('submit', { ...form.value, status: 'Draft' })
  toast.add({ title: 'Berhasil', description: 'Mitra berhasil disimpan sebagai Draft.', color: 'success' })
  close()
}

defineExpose({ open })
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :ui="{ content: 'sm:max-w-3xl' }"
  >
    <template #content>
      <div class="flex flex-col">
        <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 class="text-base font-semibold text-slate-900">
              Tambah Mitra Baru
            </h2>
            <p class="text-xs text-slate-500">
              Form multi-step untuk pendaftaran mitra
            </p>
          </div>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            @click="close"
          />
        </div>

        <div class="px-6 pt-4">
          <UStepper
            v-model="currentStep"
            :items="steps"
            class="w-full"
          />
        </div>

        <div class="max-h-[60vh] overflow-y-auto px-6 py-4">
          <div v-if="currentStep === 0" class="space-y-4">
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-700">Nama Perusahaan *</label>
              <UInput v-model="form.companyName" placeholder="Masukkan nama perusahaan" />
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-700">Kategori *</label>
                <USelect v-model="form.category" :items="categoryOptions" placeholder="Pilih kategori" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-700">Tipe Mitra *</label>
                <USelect v-model="form.partnerType" :items="partnerTypeOptions" placeholder="Pilih tipe mitra" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-700">Industri *</label>
                <USelect v-model="form.industry" :items="industryOptions" placeholder="Pilih industri" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-700">Lokasi *</label>
                <USelect v-model="form.location" :items="locationOptions" placeholder="Pilih lokasi" />
              </div>
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-700">Website</label>
              <UInput v-model="form.website" placeholder="https://example.com" />
            </div>
            <div class="rounded-lg bg-slate-50 p-3">
              <p class="text-xs font-medium text-slate-700">Partnership Code: akan dibuat otomatis oleh sistem</p>
            </div>
          </div>

          <div v-if="currentStep === 1" class="space-y-4">
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-700">Bidang Keahlian *</label>
              <USelect
                v-model="form.expertise"
                :items="expertiseOptions"
                multiple
                placeholder="Pilih keahlian"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-700">Solusi yang Ditawarkan</label>
              <UTextarea v-model="form.solutions" :rows="4" placeholder="Deskripsikan solusi yang ditawarkan" />
            </div>
          </div>

          <div v-if="currentStep === 2" class="space-y-4">
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-700">Nama Dokumen</label>
                <UInput v-model="newDoc.name" placeholder="Nama dokumen" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-700">Jenis Dokumen</label>
                <USelect v-model="newDoc.type" :items="docTypeOptions" placeholder="Pilih jenis" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-700">Tanggal Terbit</label>
                <UInput v-model="newDoc.issueDate" type="date" />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-slate-700">Tanggal Berakhir</label>
                <UInput v-model="newDoc.expiryDate" type="date" />
              </div>
            </div>
            <UButton size="sm" variant="soft" icon="i-lucide-plus" @click="addDocument">
              Tambah Dokumen
            </UButton>
            <div v-if="form.legalDocs.length" class="space-y-2">
              <div
                v-for="(doc, idx) in form.legalDocs"
                :key="idx"
                class="flex items-center justify-between rounded-lg border border-slate-200 p-2"
              >
                <div class="text-xs">
                  <p class="font-medium text-slate-700">{{ doc.name }}</p>
                  <p class="text-slate-500">{{ doc.type }} · Terbit: {{ doc.issueDate || '-' }} · Berakhir: {{ doc.expiryDate || '-' }}</p>
                </div>
                <UButton color="error" variant="ghost" size="xs" icon="i-lucide-trash-2" @click="removeDocument(idx)" />
              </div>
            </div>
          </div>

          <div v-if="currentStep === 3" class="space-y-4">
            <div class="rounded-lg border border-slate-200 p-4">
              <h3 class="mb-2 text-sm font-medium text-slate-900">Profil Perusahaan</h3>
              <div class="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                <p><span class="font-medium text-slate-700">Nama:</span> {{ form.companyName }}</p>
                <p><span class="font-medium text-slate-700">Kategori:</span> {{ form.category }}</p>
                <p><span class="font-medium text-slate-700">Tipe Mitra:</span> {{ form.partnerType }}</p>
                <p><span class="font-medium text-slate-700">Industri:</span> {{ form.industry }}</p>
                <p><span class="font-medium text-slate-700">Lokasi:</span> {{ form.location }}</p>
                <p><span class="font-medium text-slate-700">Website:</span> {{ form.website || '-' }}</p>
              </div>
            </div>
            <div class="rounded-lg border border-slate-200 p-4">
              <h3 class="mb-2 text-sm font-medium text-slate-900">Bidang Keahlian</h3>
              <p class="text-xs text-slate-600">Keahlian: {{ form.expertise.join(', ') || '-' }}</p>
              <p class="mt-1 text-xs text-slate-600">Solusi: {{ form.solutions || '-' }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 p-4">
              <h3 class="mb-2 text-sm font-medium text-slate-900">Berkas Legalitas</h3>
              <p v-if="!form.legalDocs.length" class="text-xs text-slate-500">Tidak ada dokumen</p>
              <div v-else class="space-y-1">
                <p v-for="(doc, idx) in form.legalDocs" :key="idx" class="text-xs text-slate-600">
                  {{ doc.name }} ({{ doc.type }}) - Terbit: {{ doc.issueDate || '-' }}, Berakhir: {{ doc.expiryDate || '-' }}
                </p>
              </div>
            </div>
            <div class="rounded-lg bg-amber-50 p-3">
              <p class="text-xs font-medium text-amber-700">Status awal: Draft</p>
            </div>
            <div class="rounded-lg bg-slate-50 p-3">
              <p class="text-xs font-medium text-slate-700">Partnership Code: akan dibuat otomatis oleh sistem</p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <UButton variant="ghost" :disabled="currentStep === 0" @click="prevStep">Back</UButton>
          <div class="flex gap-2">
            <UButton variant="outline" @click="saveDraft">Save as Draft</UButton>
            <UButton v-if="currentStep < steps.length - 1" @click="nextStep">Next</UButton>
            <UButton v-else @click="saveDraft">Submit</UButton>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
