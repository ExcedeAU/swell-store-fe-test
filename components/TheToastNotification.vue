<template>
  <transition name="fade-up-out" appear>
    <div v-if="type !== 'product' || product" class="sticky top-0 z-100">
      <!-- Duplicate header element  -->
      <div class="absolute top-0 right-0 w-full">
        <div
          :style="{ height: `${headerHeightOffset}px` }"
          class="ease duration-50 relative w-full transition-all"
        />

        <div
          class="top-0 right-0 mx-auto mt-3 w-full px-6 md:mr-3 md:max-w-max"
        >
          <div
            class="w-full overflow-hidden rounded-lg shadow-lg"
            :class="{
              'md:min-w-96': product,
              'bg-error-faded text-error-default': type === 'error',
              'bg-ok-faded text-primary-darkest': type === 'success',
              'bg-primary-lightest': type !== 'error' && type !== 'success',
            }"
            style="background-color: white"
          >
            <div
              class="flex items-center justify-between p-4"
              :class="{ 'mb-3 border-b border-primary-light': product }"
            >
              <div class="flex items-center">
                <div
                  v-if="type !== 'error'"
                  class="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-ok-default text-primary-lightest"
                >
                  <BaseIcon icon="uil:check" size="sm" />
                </div>
                <div
                  v-if="type === 'error'"
                  class="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-error-default text-primary-lightest"
                >
                  <BaseIcon icon="uil:times" size="sm" />
                </div>
                <span class="font-medium">{{ message }}</span>
              </div>
              <button
                v-if="product"
                type="button"
                class="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary-light p-1 transition-colors hover:bg-primary-med"
                @click="
                  $store.commit('setState', {
                    key: 'notification',
                    value: null,
                  })
                "
              >
                <BaseIcon icon="uil:times" />
              </button>
            </div>

            <!-- Added product -->
            <template v-if="product">
              <div class="flex px-4 pb-3">
                <div class="mr-4 w-24">
                  <VisualMedia
                    v-if="product.images && product.images.length"
                    :source="product.images[0]"
                    :widths="[96, 192]"
                    sizes="96px"
                    ratio="1:1"
                    class="overflow-hidden rounded-md shadow-sm"
                  />

                  <!-- Fallback image -->
                  <div
                    v-else
                    class="relative rounded-md bg-primary-lighter pb-full shadow-sm"
                  >
                    <BaseIcon
                      icon="uil:camera-slash"
                      size="lg"
                      class="center-xy absolute text-primary-med"
                    />
                  </div>
                </div>

                <!-- Name + options -->
                <div class="pt-1">
                  <NuxtLink
                    :to="
                      localePath(
                        resolveUrl({ type: 'product', value: product.slug }),
                      )
                    "
                    class="inline-block transition-colors hover:text-accent-default"
                  >
                    <h4 class="font-medium">{{ product.name }}</h4>
                  </NuxtLink>
                  <div class="mt-1 text-sm text-primary-dark">
                    <p v-if="options">
                      {{ options }}
                    </p>
                    <p v-if="trialDays">
                      {{ $tc('cart.item.trialDays', trialDays) }}
                    </p>
                  </div>

                  <!-- Price/quantity + item editor toggle -->
                  <div class="mt-2 font-medium text-primary-darkest">
                    <div class="inline-block">
                      <span>{{ formattedPrice }}</span>
                      <span v-if="product.quantity > 1" class="ml-1"
                        >({{ product.quantity }} &times;)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="flex flex-col items-center justify-center gap-3 border-t border-primary-lighter p-4 pt-2"
              >
                <BaseButton
                  class="w-1/2"
                  fit="full"
                  :link="cart.checkoutUrl"
                  appearance="dark"
                  target="_self"
                  :label="$t('notifications.checkout')"
                />

                <div class="relative w-1/2">
                  <BaseButton
                    class="w-full"
                    fit="full"
                    appearance="light"
                    :label="$t('notifications.cart')"
                    @click.native="openCart"
                  />

                  <div
                    v-if="cart && cart.itemQuantity"
                    class="fade-in absolute top-0 right-0 flex h-6 w-6 translate-x-1 -translate-y-1 transform items-center justify-center rounded-full bg-accent-default text-primary-lighter shadow-sm"
                  >
                    <span class="mt-px block text-2xs font-bold leading-none">{{
                      cart.itemQuantity
                    }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// Helpers
import { mapState } from 'vuex';

export default {
  props: {
    message: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      header: null,
      logoSrc: null,
      product: null,
      scrollY: null,
      billingSchedule: null,
    };
  },

  async fetch() {
    const { $swell } = this;

    // Fetch item that has been recently added to the cart
    if (this.addedItem) {
      const baseProduct = await $swell.products.get(this.addedItem.productId);
      const { purchaseOption } = this.addedItem;
      let product;

      if (
        purchaseOption &&
        purchaseOption.type === 'subscription' &&
        purchaseOption.plan
      ) {
        product = await $swell.products.variation(
          baseProduct,
          this.addedItem.options,
          {
            type: 'subscription',
            plan: purchaseOption.plan,
          },
        );
        const subscriptionPlan =
          product.purchaseOptions.subscription.plans.find(
            (plan) => plan.id === purchaseOption.plan,
          );
        if (subscriptionPlan) {
          this.billingSchedule = subscriptionPlan.billingSchedule;
        }
      } else {
        product = await $swell.products.variation(
          baseProduct,
          this.addedItem.options,
        );
      }

      this.product = product;
    }

    // Set component data
    this.header = await $swell.settings.get('header');
    this.logoSrc = await $swell.settings.get('header.logo.file.url');
  },

  computed: {
    ...mapState([
      'cart',
      'cartIsUpdating',
      'currency',
      'addedItem',
      'headerIsVisible',
      'headerHeight',
      'currency',
    ]),

    options() {
      if (!this.addedItem) return;

      const options = Object.values(this.addedItem.options);
      return options.join(', ');
    },

    formattedPrice() {
      const { product, addedItem } = this;
      if (!product) return '';

      const { purchaseOption } = addedItem;

      if (purchaseOption && purchaseOption.type === 'subscription') {
        // Get selected subscription billing schedule
        const plan = product.purchaseOptions.subscription.plans.find((plan) => {
          return plan.id === purchaseOption.plan;
        });

        if (!plan) return '';

        const { interval, intervalCount } = plan.billingSchedule;

        const subscriptionInterval = this.$t(
          `products._slug.purchaseOptions.interval.${interval}.short`,
        );

        return `${this.formatMoney(product.price, this.currency)}/${
          intervalCount > 1 ? intervalCount : ''
        }${subscriptionInterval}`;
      }

      return this.formatMoney(product.price, this.currency);
    },

    headerHeightOffset() {
      // Set initial height before scroll initiates
      if (this.scrollY === null) {
        if (!this.headerIsVisible) return 0;
        if (this.headerIsVisible) return this.headerHeight;
      }

      if (!this.headerIsVisible) return 0;

      if (this.scrollY < this.headerHeight) {
        return this.headerHeight - (this.headerHeight - this.scrollY);
      }
      return this.headerHeight;
    },

    intervalCount() {
      if (!this.billingSchedule) return null;
      return this.billingSchedule.intervalCount;
    },

    subscriptionInterval() {
      if (!this.billingSchedule) return null;
      return this.$t(
        `products._slug.purchaseOptions.interval.${this.billingSchedule.interval}.short`,
      );
    },

    trialDays() {
      if (!this.billingSchedule) return null;
      return this.billingSchedule.trialDays;
    },
  },

  watch: {
    // If no added item in notification, hide recently added product
    addedItem(item) {
      if (!item) this.product = null;
    },
  },

  mounted() {
    this.onScroll();
    window.addEventListener('scroll', this.onScroll);
  },

  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll);
  },

  methods: {
    onScroll() {
      this.scrollY = window.scrollY;
    },

    openCart() {
      // Open cart and close notification
      this.$store.commit('setState', { key: 'cartIsActive', value: true });
      this.$store.commit('setState', { key: 'notification', value: null });
    },
  },
};
</script>
