<template>
  <tbody>
    <tr v-for="(message, i) in messages" :key="i">
      <td>
        <a class="tx-table-cell-icon">
          <svg v-pre xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none">
            <path
              d="M7.665 9.301c-.155-.067-.338-.206-.549-.417a2.6 2.6 0 0 1 0-3.677l1.768-1.768a2.6 2.6 0 0 1 3.677 3.677l-1.167 1.167m-3.06-1.584c.156.067.339.206.55.417a2.6 2.6 0 0 1 0 3.677l-1.768 1.768A2.6 2.6 0 1 1 3.44 8.884l1.167-1.167"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="1.3"
            />
          </svg>
        </a>
      </td>
      <td>
        <div class="tx-table__cell">
          <!-- <ui-timeago :timestamp="tx.time"/> -->
          {{ message }}
        </div>
      </td>
      <td>
        <div class="tx-table__cell tx-table__cell--align-right">
          <span v-if="!from">hidden</span>
          <ui-address
            v-else
            :address="from.toFriendly({ urlSafe: true, bounceable: true })"
            :disabled="isOut"
          />
        </div>
      </td>
      <td>
        <div class="tx-table__cell" style="padding: 0">
          <span v-if="isService" class="tx-table__badge tx-table__badge--service">OUT</span>
          <span v-else-if="isOut" class="tx-table__badge tx-table__badge--out">OUT</span>
          <span v-else class="tx-table__badge tx-table__badge--in">IN</span>
        </div>
      </td>
      <td>
        <div class="tx-table__cell">
          <!-- <ui-address v-bind:address="to.toFriendly({urlSafe: true, bounceable: true})" v-bind:disabled="!isOut"/> -->
        </div>
      </td>
      <td>
        <div
          class="tx-table__cell tx-table__cell--align-right"
          style="position: relative; padding-right: 26px"
        >
          {{ $ton(amount.coins.toNumber()) }} TON

          <!-- <svg v-if="message" style="position: absolute; right: 1px;" width="14" height="14" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path d="M0 0h14v14H0z"/><path d="M3.375 1.35h7.3a2 2 0 0 1 2 2v5.3a2 2 0 0 1-2 2H7.6l-2.77 2.424a.5.5 0 0 1-.83-.376V10.65h-.625a2 2 0 0 1-2-2v-5.3a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></g></svg> -->
        </div>
      </td>
      <td>
        <div class="tx-table__cell">
          <svg
            class="tx-table-expand-caret"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            :class="{ 'tx-table-expand-caret--expanded': isVisible }"
          >
            <path
              stroke="currentColor"
              stroke-width="1.3"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m1.5 4.75 5.5 5.5 5.5-5.5"
            />
          </svg>
        </div>
      </td>
    </tr>

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
  </tbody>
</template>

<script lang="ts">
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
</script>
