<template>
<div>
<md-progress-bar md-mode="indeterminate" v-if="!$store.state.web3.ready" />
<div v-if="$store.state.web3.ready">
<p class="paragraph">
Authenticated through web3 as {{ $store.state.web3.base.account }}.
<br />
{{ $store.state.web3.token.balance.div($store.state.web3.token.multiplier).toNumber() }} WYV tokens held, {{ $store.state.web3.token.balance.div($store.state.web3.token.supply).toNumber() * 100 }}% of total supply.
<br />
{{ $store.state.web3.dao.delegatedAmountsByDelegate.div($store.state.web3.token.multiplier).toNumber() }} votes are presently delegated to you.
</p>
<div class="header">
Recent events:
</div>
<md-card v-for="(e, index) in events" :key="index">
  <md-card-header>
    <div>
      <span class="subtitle">{{ e.event }} </span>
      <span class="what">{{ summarize(e.event, e.returnValues) }}</span>
    </div>
    <div class="md-subhead">Traced in transaction #{{ e.transactionIndex }} of block {{ e.blockNumber }}.</div>
  </md-card-header>
</md-card>
</div>
</div>
</template>

<script>
export default {
  metaInfo: {
    title: 'Home'
  },
  methods: {
    summarize: function (event, params) {
      switch(event) {
        case 'TokensUndelegated':
          return (params.delegator + ' undelegated ' + (params.numberOfTokens.div(this.$store.state.web3.token.multiplier).toNumber()) + ' votes from ' + params.delegate + '.')
        case 'TokensDelegated':
          return (params.delegator + ' delegated ' + (params.numberOfTokens.div(this.$store.state.web3.token.multiplier).toNumber()) + ' votes to ' + params.delegate + '.')
        default:
          return 'Unknown event'
      }
    }
  },
  computed: {
    events: function() {
      return this.$store.state.web3.dao.events.slice(0, 10);
    }
  }
}
</script>

<style scoped>
.paragraph {
  padding: 20px;
  padding-top: 0px;
}

.header {
  padding-bottom: 10px;
  padding-left: 20px;
}

.subtitle {
  font-weight: bold;
}

.what {
}
</style>
