<template>
<div>
<md-toolbar class="md-transparent" md-elevation="0">
  <md-icon>wifi_tethering</md-icon>
  <span class="md-title">Network Configuration</span>
</md-toolbar>
<md-list>
  <md-list-item>
    <span class="md-list-item-text">Ethereum Kovan</span>
  </md-list-item>
  <md-list-item>
    <span class="md-list-item-text">Block {{ $store.state.web3.blockNumber }}</span>
  </md-list-item>
  <md-list-item>
    <span class="md-list-item-text">Account {{ $store.state.web3.account }}</span>
  </md-list-item>
</md-list>
</div>
</template>

<script>
export default {
  name: 'rightDrawer'
}
</script>
