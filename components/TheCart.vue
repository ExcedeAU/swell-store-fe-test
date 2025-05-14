<template>
  <transition name="slide-modal-rtl" :duration="700">
    <div class="fixed inset-0 z-50">
      <!-- Overlay -->
      <div
        class="overlay absolute hidden h-full w-full bg-primary-darker opacity-50 md:block"
        @click="closeCart"
      />

      <!-- Panel -->
      <div
        class="panel absolute right-0 h-full w-full max-w-112 shadow-md"
        style="background-color: #ffffff"
      >
        <div
          class="h-full w-full overflow-y-scroll"
          style="background-color: #ffffff"
        >
          <!-- Header -->
          <div class="container relative border-b border-primary-med py-6">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold">
                {{ $t('cart.title') }}
                <span
                  v-if="cart && cart.itemQuantity"
                  class="ml-1 text-lg font-medium"
                  >({{ cart.itemQuantity }})</span
                >
              </h3>
              <button
                @click.prevent="closeCart"
                class="rounded-full p-1 hover:bg-primary-lighter"
              >
                <BaseIcon icon="uil:multiply" size="lg" />
              </button>
            </div>

            <div
              v-if="$te('cart.infoText')"
              class="mt-4 text-sm text-primary-dark"
              v-html="$t('cart.infoText')"
            />
          </div>

          <!-- Items -->
          <div v-if="cart && cart.items && cart.items.length" class="py-2">
            <CartItem
              v-for="(item, index) in cart.items"
              :key="`cartItem_${item.id}`"
              :item="item"
              :index="index"
              class="border-b border-primary-lighter last:border-b-0"
            />
          </div>
          <div v-else class="container py-16 text-center">
            <span class="mb-6 block text-lg">{{ $t('cart.empty') }}</span>
            <BaseButton
              :link="shopLink"
              :label="$t('cart.backToProducts')"
              fit="static"
              class="mx-auto"
            />
          </div>

          <!-- Footer -->
          <div
            v-if="cart && cart.items && cart.items.length"
            class="border-t border-primary-med bg-primary-lighter"
          >
            <div class="container border-b border-primary-med py-8">
              <h4 class="mb-4 font-medium">{{ $t('cart.applyCoupon') }}</h4>
              <div class="flex">
                <div class="relative mr-2 flex-grow">
                  <input
                    v-model.trim="couponCode"
                    type="text"
                    placeholder="Add coupon or gift card code"
                    class="input-coupon focus:outline-none h-full w-full rounded border border-primary-med bg-primary-lightest px-4 py-3 text-sm font-medium focus:shadow-outline"
                  />
                  <transition name="fade">
                    <div
                      v-show="couponError"
                      class="absolute mt-1 w-full rounded bg-error-faded px-3 py-1 text-sm text-error-default"
                    >
                      {{ couponError }}
                    </div>
                  </transition>
                </div>

                <BaseButton
                  class="flex-shrink-0"
                  :label="$t('cart.applyCoupon')"
                  :disabled="!couponCode"
                  fit="auto"
                  @click.native="applyDiscount"
                />
              </div>

              <!-- Applied discounts -->
              <div v-if="cart" class="mt-6">
                <div
                  v-if="cart.couponCode"
                  class="mt-4 flex items-center rounded bg-primary-lightest p-3"
                >
                  <p class="label-xs-bold flex-grow">{{ cart.couponCode }}</p>
                  <button
                    class="relative ml-3 h-7 w-7 rounded-full bg-primary-light hover:bg-primary-med"
                    @click="removeDiscount()"
                  >
                    <BaseIcon
                      class="center-xy absolute"
                      icon="uil:multiply"
                      size="sm"
                    />
                  </button>
                </div>
                <div
                  v-for="giftcard in cart.giftcards"
                  :key="giftcard.id"
                  class="mt-4 rounded bg-primary-lightest p-3"
                >
                  <p class="label-xs-bold flex items-center">
                    <span class="flex-grow"
                      >**** **** **** {{ giftcard.last4 }}</span
                    >
                    <button
                      class="relative ml-3 h-7 w-7 rounded-full bg-primary-light hover:bg-primary-med"
                      @click="removeDiscount(giftcard.id, currency)"
                    >
                      <BaseIcon
                        class="center-xy absolute"
                        icon="uil:multiply"
                        size="sm"
                      />
                    </button>
                  </p>
                  <p class="mt-1 text-sm text-primary-dark">
                    {{
                      $t('cart.giftCard', {
                        amount: formatMoney(giftcard.amount, currency),
                      })
                    }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Summary -->
            <div class="container py-8">
              <h4 class="mb-5 font-medium">{{ $t('cart.summary') }}</h4>
              <div class="mb-2 flex justify-between text-sm">
                <span class="text-primary-dark">{{ $t('cart.subtotal') }}</span>
                <span class="font-medium">{{
                  formatMoney(cart.subTotal, currency)
                }}</span>
              </div>
              <div class="mb-2 flex justify-between text-sm">
                <span class="text-primary-dark">{{ $t('cart.shipping') }}</span>
                <span class="font-medium">{{
                  formatMoney(cart.shipmentTotal, currency)
                }}</span>
              </div>
              <div
                v-show="cart.discountTotal"
                class="mb-2 flex justify-between text-sm"
              >
                <span class="text-primary-dark">{{
                  $t('cart.discounts')
                }}</span>
                <span class="font-medium text-error-default"
                  >–{{ formatMoney(cart.discountTotal, currency) }}</span
                >
              </div>
              <div
                v-show="cart.giftcardTotal"
                class="mb-2 flex justify-between text-sm"
              >
                <span class="text-primary-dark">{{
                  $t('cart.giftcards')
                }}</span>
                <span class="font-medium text-error-default"
                  >–{{ formatMoney(cart.giftcardTotal, currency) }}</span
                >
              </div>
              <div
                v-show="cart.taxTotal"
                class="mb-2 flex justify-between text-sm"
              >
                <span class="text-primary-dark">{{ $t('cart.taxes') }}</span>
                <span class="font-medium">{{
                  formatMoney(cart.taxTotal, currency)
                }}</span>
              </div>

              <div class="my-4 border-t border-primary-med"></div>

              <h3 class="mb-6 flex justify-between text-xl font-bold">
                <span>{{ $t('cart.total') }}</span>
                <span>{{ formatMoneyRounded(cart.grandTotal, currency) }}</span>
              </h3>

              <div
                v-if="account && account.balance && account.balance > 0"
                class="mb-6 rounded bg-primary-lightest p-4"
              >
                <div class="flex justify-between">
                  <span class="font-medium">{{
                    $t('cart.accountBalance')
                  }}</span>
                  <span class="font-medium">{{
                    formatMoney(account.balance, currency)
                  }}</span>
                </div>
              </div>

              <BaseButton
                class="mt-2 mb-4 block w-full border"
                size="lg"
                :label="$t('cart.checkout')"
                :is-loading="cartIsUpdating"
                :loading-label="$t('cart.updating')"
                :link="cart.checkoutUrl"
                target="_self"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// Helpers
import { mapState } from 'vuex';
import { isCouponValid } from '~/utils/coupon';
import { isGiftCardValid } from '~/utils/giftcards';

export default {
  name: 'TheCart',

  data() {
    return {
      couponCode: null,
      couponError: null,
      couponTimeout: null,
      shopLink: null,
    };
  },

  async fetch() {
    // Set component data
    const { $swell } = this;
    this.shopLink = await $swell.settings.get('cart.shopLink', '/categories/');
  },

  computed: {
    ...mapState(['cart', 'cartIsUpdating', 'currency', 'locale']),

    account() {
      if (!this.cart.account) return;
      return this.cart.account;
    },
  },

  watch: {
    currency() {
      this.$store.dispatch('initializeCart', {});
    },
    locale() {
      this.$store.dispatch('initializeCart', {});
    },
  },

  mounted() {
    // Pass a checkout ID as a query string param to recover a specific cart
    const { checkout: checkoutId } = this.$route.query;
    this.$store.dispatch('initializeCart', { checkoutId });
  },

  beforeDestroy() {
    if (this.couponTimeout) {
      clearTimeout(this.couponTimeout);
    }
  },

  methods: {
    closeCart() {
      this.$store.commit('setState', { key: 'cartIsActive', value: false });
    },

    /**
     * Sets the coupon error message and the timeout to clear it
     * @param {string} message - The error message to show
     */
    setCouponError(message) {
      this.couponError = message;
      if (this.couponTimeout) clearTimeout(this.couponTimeout);
      this.couponTimeout = setTimeout(() => {
        this.couponError = null;
      }, 5000);
    },

    async applyDiscount() {
      if (
        !(isGiftCardValid(this.couponCode) || isCouponValid(this.couponCode))
      ) {
        this.setCouponError(this.$i18n.t('errors.invalidGiftCard'));
      } else {
        const error = await this.$store.dispatch(
          'applyDiscount',
          this.couponCode,
        );
        if (error) {
          this.setCouponError(error);
        }
      }
      // Reset the coupon input
      this.couponCode = null;
    },

    removeDiscount(id) {
      this.$store.dispatch('removeDiscount', id);
    },
  },
};
</script>

<style scoped>
.input-coupon::placeholder {
  text-overflow: ellipsis;
}
</style>
