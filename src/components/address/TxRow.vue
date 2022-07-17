<script setup lang="ts">
import { RawTransaction, Address } from '@/ton/src'
import BN from 'bn.js'
import { computed, PropType, ref } from 'vue'
import MessageRow from './MessageRow.vue'
import MultiOutputRow from './MultiOutputRow.vue'

const props = defineProps({
  tx: {
    type: Object as PropType<RawTransaction>,
    required: true,
    // default: () => undefined
  },
  address: {
    type: Object as PropType<Address>,
    required: false,
    default: () => undefined,
  },
})

const isVisible = ref<boolean>(false)

const messages = computed(() => {
  return [props.tx.inMessage, ...props.tx.outMessages]
})

// txLinkRouteParams() {
//     return {
//         lt: this.txLt,
//         hash: this.txHash,
//         address: this.isOut ? this.from : this.to,
//     };
// },

// dateTime() {
//     return new Date(this.timestamp);
// },
</script>

<template>
  <template v-if="tx.outMessagesCount < 10">
    <tbody v-for="(message, i) in tx.outMessages" :key="i" :class="i > 0 && 'sub-list'">
      <MessageRow :tx="tx" :message="message" :source="'out'" />
    </tbody>
  </template>
  <MultiOutputRow v-else :tx="tx" />

  <tbody v-if="tx.inMessage" :class="messages.length > 1 && 'sub-list'">
    <MessageRow :tx="tx" :message="tx.inMessage" :source="'in'" />
  </tbody>
</template>

<!-- <tr v-show="isVisible" class="tx-table-row-details">
            <td colspan="10">
                <div class="tx-table-inner-container">
                    <div class="tx-table-inner">
                        <div class="tx-table-inner__header" v-text="$t('tx.timestamp')"/>
                        {{dateTime.toLocaleString()}}
                    </div>

                    <div class="tx-table-inner">
                        <div class="tx-table-inner__header" v-text="$t('tx.hash')"/>

                        <ui-copy-button show-button v-bind:copy="txHash" v-bind:successMessage="$t('tx.hash_copy_success')">
                            {{txHash}}
                        </ui-copy-button>
                    </div>

                    <div class="tx-table-inner">
                        <div class="tx-table-inner__header" v-text="$t('tx.lt')"/>

                        <ui-copy-button show-button v-bind:copy="txLt" v-bind:successMessage="$t('tx.lt_copy_success')">
                            {{txLt}}
                        </ui-copy-button>
                    </div>

                    <div class="tx-table-inner">
                        <div class="tx-table-inner__header" v-text="$t('tx.fee')"/>
                        {{$ton(fee)}} TON
                    </div>

                    <div v-if="message" class="tx-table-inner">
                        <div class="tx-table-inner__header" v-text="$t('tx.message')"/>
                        {{message}}
                    </div>
                </div>
            </td>
        </tr> -->
<!-- </tbody> -->

<!-- <script lang="ts">
import { Address, Cell, RawTransaction } from '@/ton/src'
import { defineComponent, PropType } from 'vue'
import BN from 'bn.js'

export default defineComponent({
  props: {
    tx: {
      type: Object as PropType<RawTransaction>,
      required: true,
      // default: () => undefined
    },
    address: {
      type: Object as PropType<Address>,
      required: false,
      default: () => undefined,
    },
  },
  // props: {
  //     tx: {
  //         type: Object as PropType<RawTransaction>,
  //     },
  //     // date: String,
  //     // from: Address,
  //     // isOut: Boolean,
  //     // isService: Boolean,
  //     // to: Address,
  //     // amount: String,
  //     // message: String,
  //     // timestamp: Number,
  //     // fee: String,
  //     // txHash: String,
  //     // txLt: String,
  // },

  data() {
    return {
      isVisible: false,
    }
  },

  computed: {
    messages() {
      return [this.tx.inMessage, ...this.tx.outMessages]
    },
    // txLinkRouteParams() {
    //     return {
    //         lt: this.txLt,
    //         hash: this.txHash,
    //         address: this.isOut ? this.from : this.to,
    //     };
    // },

    // dateTime() {
    //     return new Date(this.timestamp);
    // },

    sourceAddress() {
      return this.tx.inMessage?.info.src || this.tx.outMessages[0]?.info.src
    },

    isOut() {
      return this.address && this.sourceAddress && this.address.equals(this.sourceAddress)
    },

    from() {
      return this.tx.inMessage?.info.src
    },

    isService() {
      return false
    },

    amount() {
      return {
        coins: new BN(0),
      }
    },
  },

  created() {
    // this.$bus.$on('tx-close-all', () => this.isVisible = false);
  },

  beforeUnmount() {
    // this.$bus.$off('tx-close-all');
  },

  methods: {
    // open() {
    //     !this.isVisible && this.$bus.$emit('tx-close-all');
    //     this.isVisible = !this.isVisible;
    // },
  },
})
</script> -->
