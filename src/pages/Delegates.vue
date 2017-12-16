<template>
<div>
<md-progress-bar md-mode="indeterminate" v-if="!$store.state.web3.ready" class="loading"></md-progress-bar>
<div v-if="$store.state.web3.ready">
<p>
Total tokens locked in vote delegation: {{ $store.state.web3.dao.totalLockedTokens.div($store.state.web3.token.multiplier).toNumber() }}.
</p>
<div v-if="!pending && canDelegate">
<div v-if="alreadyDelegated">
<p>You are presently delegating {{ initialAmount }} votes to {{ initialDelegate }}.</p>
<md-button class="md-raised" v-on:click="undelegateShares">Undelegate</md-button>
</div>
<div v-if="!alreadyDelegated">
You are not currently delegating votes.
<md-field class="input">
  <label>Delegate Address</label>
  <md-input v-model="delegate"></md-input>
</md-field>
<md-field class="input">
  <label>Amount (tokens)</label>
  <md-input v-model="amount" type="number"></md-input>
</md-field>
<md-button class="md-raised" v-on:click="delegateShares">Delegate</md-button>
</div>
</div>
<div v-if="pending">
<md-progress-bar md-mode="indeterminate" class="pending"></md-progress-bar>
</div>
<md-snackbar :md-active.sync="commit">Transaction(s) committed!</md-snackbar>
</div>
</div>
</template>

<script>
export default {
  metaInfo: {
    title: 'Delegates'
  },
  data: () => {
    return {
      pending: false,
      commit: false,
      delegate: null,
      amount: null
    }
  },
  computed: {
    canDelegate: function() {
      return this.$store.state.web3.base.account !== null;
    },
    alreadyDelegated: function() {
      return this.$store.state.web3.dao.delegatesByDelegator !== null;
    },
    initialDelegate: function() {
      return this.$store.state.web3.dao.delegatesByDelegator;
    },
    initialAmount: function() {
      return this.$store.state.web3.dao.lockedDelegatingTokens.div(this.$store.state.web3.token.multiplier).toNumber();
    }
  },
  methods: {
    delegateShares: function() {
      const onTxHash = (txHash) => {
        this.commit = true
        this.pending = true
      }
      const onConfirm = () => {
        this.pending = false
      }
      const amount = this.$store.state.web3.token.multiplier.mul(this.amount)
      this.$store.dispatch('approve', { params: [this.$store.state.web3.dao.address, amount], onTxHash: () => {}, onConfirm: () => {}})
      this.$store.dispatch('setDelegateAndLockTokens', { params: [amount, this.delegate], onTxHash: onTxHash, onConfirm: onConfirm })
    },
    undelegateShares: function() {
      const onTxHash = (txHash) => {
        this.commit = true
        this.pending = true
      }
      const onConfirm = () => {
        this.pending = false
      }
      this.$store.dispatch('clearDelegateAndUnlockTokens', { params: [], onTxHash: onTxHash, onConfirm: onConfirm })
    }
  }
}
</script>

<style scoped>
.input {
  max-width: 500px;
}

.loading {
  margin: 20px;
}

.pending {
  margin: 20px;
  margin-left: 0px;
}
</style>
