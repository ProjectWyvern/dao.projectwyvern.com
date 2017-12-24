<template>
<div>
<md-progress-bar md-mode="indeterminate" v-if="!$store.state.web3.ready" class="loading"></md-progress-bar>
<p v-if="$store.state.web3.ready">
DAO address: {{ $store.state.web3.dao.address }} <br />

DAO Ether balance: {{ $store.state.web3.dao.balance.div($store.state.web3.token.multiplier).toNumber() }} <br />
</p>
</div>
</template>

<script>
export default {
  metaInfo: {
    title: 'Assets'
  }
}
</script>

<style scoped>
.loading {
  margin: 20px;
}
</style>
