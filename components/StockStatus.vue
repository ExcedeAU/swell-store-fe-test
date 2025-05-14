<template>
  <div class="mb-4 rounded-md border p-3" :class="statusBorderClass">
    <div class="flex flex-wrap items-center justify-between">
      <div class="flex items-center">
        <span
          :class="`bg-${status.color}-default`"
          class="mr-2 inline-block h-3 w-3 rounded-full"
        />
        <span class="font-medium text-primary-darkest">{{
          $t(status.label)
        }}</span>
        <span
          v-if="showStockLevel && stockLevel > 0 && bundleItemsAvailable"
          class="ml-2 text-sm text-primary-dark"
        >
          • {{ $t('products._slug.stockRemaining', { n: stockLevel }) }}
        </span>
      </div>
      <div>
        <a
          v-if="status.link"
          href="#"
          class="text-sm font-medium text-primary-darkest underline hover:text-accent-default"
        >
          {{ $t(status.message) }}
        </a>
        <span v-else class="text-sm text-primary-dark">{{
          $t(status.message)
        }}</span>
      </div>
    </div>
  </div>
</template>

<script>
// Helpers
import get from 'lodash/get';

// TODO: replace this with global settings or singleton content
const statuses = {
  custom: {
    color: 'warning',
    label: 'products._slug.stockStatus.custom.label',
    message: 'products._slug.stockStatus.custom.message',
  },
  in_stock: {
    color: 'ok',
    label: 'products._slug.stockStatus.inStock.label',
    message: 'products._slug.stockStatus.inStock.message',
  },
  limited_availability: {
    color: 'warning',
    label: 'products._slug.stockStatus.limitedAvailability.label',
    message: 'products._slug.stockStatus.limitedAvailability.message',
  },
  out_of_stock: {
    color: 'error',
    label: 'products._slug.stockStatus.outOfStock.label',
    message: 'products._slug.stockStatus.outOfStock.message',
  },
  bundle_items_unavailable: {
    color: 'error',
    label: 'products._slug.stockStatus.bundleItemsUnavailable.label',
    message: 'products._slug.stockStatus.bundleItemsUnavailable.message',
  },
};

export default {
  name: 'StockStatus',

  props: {
    statusValue: {
      type: String,
      default: 'out_of_stock',
    },
    bundleItemsAvailable: {
      type: Boolean,
      default: true,
    },
    stockLevel: {
      type: Number,
      default: 0,
    },
    showStockLevel: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    status() {
      if (!this.bundleItemsAvailable)
        return get(statuses, 'bundle_items_unavailable', {});
      return get(statuses, this.statusValue || 'out_of_stock', {});
    },

    statusBorderClass() {
      const colorMap = {
        ok: 'border-ok-default border-opacity-30',
        warning: 'border-warning-default border-opacity-30',
        error: 'border-error-default border-opacity-30',
      };

      return colorMap[this.status.color] || 'border-primary-light';
    },
  },
};
</script>
