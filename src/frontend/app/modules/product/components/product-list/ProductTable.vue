<script setup lang="ts">
import type { ProductItem } from '../../types/product.types'
import ProductStatusBadge from './ProductStatusBadge.vue'

interface Props {
  items: ProductItem[]
  totalCount: number
  totalResults: number
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'edit' | 'delete', item: ProductItem): void
}>()
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
    <div class="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-sm font-semibold text-slate-900">
          Product Library
        </h2>
        <p class="text-[11px] font-medium text-slate-500">
          {{ totalResults }} of {{ totalCount }} products
        </p>
      </div>
      <p class="text-[10px] font-medium text-slate-400">
        Sorted alphabetically by product name
      </p>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[720px] text-left text-xs">
        <thead class="border-b border-slate-100 bg-slate-50/70">
          <tr>
            <th class="px-4 py-3 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Product
            </th>
            <th class="px-4 py-3 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Description
            </th>
            <th class="px-4 py-3 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Status
            </th>
            <th class="px-4 py-3 text-right text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>

        <tbody
          v-if="items.length === 0"
          class="divide-y divide-slate-100"
        >
          <tr>
            <td
              colspan="4"
              class="px-4 py-10"
            >
              <div class="flex flex-col items-center gap-2.5 text-center">
                <UIcon
                  :name="totalCount === 0 ? 'i-lucide-package-open' : 'i-lucide-search-x'"
                  class="h-8 w-8 text-slate-300"
                />
                <div>
                  <p class="text-xs font-semibold text-slate-700">
                    {{ totalCount === 0 ? 'No products yet' : 'No matching products' }}
                  </p>
                  <p class="mt-0.5 text-[11px] text-slate-500">
                    {{
                      totalCount === 0
                        ? 'Get started by adding your first product.'
                        : 'Try adjusting your search or status filter.'
                    }}
                  </p>
                </div>
                <button
                  v-if="totalCount === 0"
                  type="button"
                  class="mt-1 inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white shadow-xs transition-all hover:bg-blue-700 cursor-pointer"
                  @click="emit('add')"
                >
                  <UIcon
                    name="i-lucide-plus"
                    class="h-3.5 w-3.5"
                  />
                  <span>Add Product</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>

        <tbody
          v-else
          class="divide-y divide-slate-100"
        >
          <tr
            v-for="item in items"
            :key="item.id"
            class="transition-colors hover:bg-slate-50/70"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <UIcon
                    name="i-lucide-package"
                    class="h-4 w-4"
                  />
                </div>
                <p class="max-w-[220px] truncate font-semibold text-slate-800">
                  {{ item.productName }}
                </p>
              </div>
            </td>

            <td class="max-w-md px-4 py-3">
              <p
                class="line-clamp-2 text-[11px] leading-4 text-slate-500"
                :title="item.productDescription"
              >
                {{ item.productDescription || 'No description provided' }}
              </p>
            </td>

            <td class="px-4 py-3">
              <ProductStatusBadge :status="item.productStatus" />
            </td>

            <td class="px-4 py-3">
              <div class="flex justify-end gap-1.5">
                <button
                  type="button"
                  class="inline-flex h-6.5 w-6.5 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                  title="Edit product"
                  aria-label="Edit product"
                  @click="emit('edit', item)"
                >
                  <UIcon
                    name="i-lucide-pencil"
                    class="h-3.5 w-3.5"
                  />
                </button>

                <button
                  type="button"
                  class="inline-flex h-6.5 w-6.5 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                  title="Delete product"
                  aria-label="Delete product"
                  @click="emit('delete', item)"
                >
                  <UIcon
                    name="i-lucide-trash-2"
                    class="h-3.5 w-3.5"
                  />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
