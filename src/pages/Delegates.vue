<template>
<div>
<p>
Total tokens locked in vote delegation: {{ $store.state.web3.totalLockedTokens }}.
</p>
<div v-if="alreadyDelegated">
<p>{{ initialAmount }} votes delegated to {{ initialDelegate }}.</p>
<md-button class="md-raised" v-on:click="undelegateShares">Undelegate</md-button>
</div>
<div v-if="!alreadyDelegated">
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
<md-snackbar :md-active.sync="updated">Transaction committed - {{ this.txHash }}!</md-snackbar>
</div>
</template>

<script>
export default {
  metaInfo: {
    title: 'Delegates'
  },
  data: () => {
    return {
      updated: false,
      delegate: null,
      amount: null,
      txHash: null
    }
  },
  computed: {
    alreadyDelegated: function() {
      return this.$store.state.web3.delegate !== null;
    },
    initialDelegate: function() {
      return this.$store.state.web3.delegate;
    },
    initialAmount: function() {
      return this.$store.state.web3.delegatedAmount;
    }
  },
  methods: {
    delegateShares: function() {
      const onTxHash = (txHash) => {
        this.txHash = txHash;
        this.updated = true;
      }
      this.$store.dispatch('delegateShares', { delegate: this.delegate, tokens: this.amount, onTxHash: onTxHash })
    },
    undelegateShares: function() {
      const onTxHash = (txHash) => {
        this.txHash = txHash;
        this.updated = true;
      }
      this.$store.dispatch('undelegateShares', { onTxHash: onTxHash })
    }
  }
}
</script>

<style scoped>
.input {
  width: 300px;
}
</style>
