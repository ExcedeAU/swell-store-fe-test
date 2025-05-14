<template>
  <div
    class="flex items-center overflow-hidden rounded-md border border-primary-light shadow-sm"
  >
    <button
      type="button"
      class="relative inline-block h-10 w-10 bg-primary-lighter transition-colors hover:bg-primary-light"
      :class="{
        'cursor-not-allowed opacity-25':
          !stockAvailable || value === 1 || cartIsUpdating,
        'hover:bg-primary-lighter':
          !stockAvailable || value === 1 || cartIsUpdating,
      }"
      :disabled="!stockAvailable || value === 1 || cartIsUpdating"
      @click.prevent="decrementQuantity()"
    >
      <BaseIcon
        icon="uil:minus"
        size="sm"
        class="center-xy absolute text-primary-darkest"
      />
    </button>

    <input
      class="focus:outline-none w-12 border-0 bg-primary-lightest p-1 text-center text-lg font-medium"
      type="number"
      min="1"
      :max="limit"
      :value="value"
      @change="setQuantity($event.target.value)"
    />

    <button
      type="button"
      class="relative inline-block h-10 w-10 bg-primary-lighter transition-colors hover:bg-primary-light"
      :class="{
        'cursor-not-allowed opacity-25':
          !stockAvailable || value === limit || cartIsUpdating,
        'hover:bg-primary-lighter':
          !stockAvailable || value === limit || cartIsUpdating,
      }"
      :disabled="!stockAvailable || value === limit || cartIsUpdating"
      @click.prevent="incrementQuantity()"
    >
      <BaseIcon
        icon="uil:plus"
        size="sm"
        class="center-xy absolute text-primary-darkest"
      />
    </button>
  </div>
</template>

<script>
// Helpers
import { mapState } from 'vuex';

export default {
  props: {
    value: {
      type: Number,
      required: true,
    },
    initialLimit: {
      type: Number,
      default: 99,
    },
    stockTracking: {
      type: Boolean,
      default: false,
    },
    stockPurchasable: {
      type: Boolean,
      default: false,
    },
    stockLevel: {
      type: Number,
      default: null,
    },
  },

  data() {
    return {
      limit: 99,
    };
  },

  computed: {
    ...mapState(['cartIsUpdating']),

    stockAvailable() {
      return (
        !this.stockTracking ||
        this.stockPurchasable ||
        (this.stockTracking && this.stockLevel > 0)
      );
    },
  },

  watch: {
    stockLevel() {
      this.setLimit();
    },
  },

  created() {
    this.limit = this.initialLimit;
    this.setLimit();
  },

  methods: {
    // Set limit depending on variant
    setLimit() {
      if (!this.stockTracking || this.stockPurchasable) return;
      this.limit = this.stockLevel;
      const newValue = this.value > this.limit ? this.limit : this.value;
      this.setQuantity(newValue);
    },

    // Increment quantity
    incrementQuantity() {
      const newQuantity = this.value + 1;
      this.setQuantity(newQuantity);
    },

    // Decrement quantity
    decrementQuantity() {
      const newQuantity = this.value - 1;
      this.setQuantity(newQuantity);
    },

    setQuantity(newQuantity) {
      if (isNaN(newQuantity) || +newQuantity <= 0 || !newQuantity) {
        this.$emit('input', 1);
      } else {
        const quantity = Math.min(
          newQuantity % 1 !== 0 ? Math.round(newQuantity) : newQuantity,
          this.limit,
        );

        this.$emit('input', quantity);
      }
    },
  },
};
</script>
