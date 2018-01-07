<template>
<div>
<md-toolbar class="md-transparent" md-elevation="0">
  <span class="md-title">Network Configuration</span>
  <md-icon>wifi_tethering</md-icon>
</md-toolbar>
<md-progress-bar md-mode="indeterminate" v-if="!$store.state.web3.ready" class="loading"></md-progress-bar>
<md-field class="provider">
  <label for="provider">Web3 Provider</label>
  <md-select v-model="provider" name="provider" id="provider">
    <md-option value="injected">Injected Web3 (Metamask/Parity)</md-option>
    <md-option value="http://localhost:8545">Localhost (Parity/Geth)</md-option>
    <md-option value="https://mainnet.infura.io/8jK7Ap7Z0o5ZfSZ5dyv6">Infura [Mainnet]</md-option>
    <md-option value="https://rinkeby.infura.io/8jK7Ap7Z0o5ZfSZ5dyv6">Infura [Rinkeby]</md-option>
  </md-select>
</md-field>
<md-list v-if="$store.state.web3.ready">
  <md-list-item class="item">
    Latency {{ $store.state.web3.latency }}s
  </md-list-item>
  <md-list-item class="item">
    Network {{ capitalize($store.state.web3.base.network) }}
  </md-list-item>
  <md-list-item class="item">
    Block {{ $store.state.web3.base.blockNumber }}
  </md-list-item>
  <md-list-item class="item">
    {{ $store.state.web3.base.account ? 'Account ' + $store.state.web3.base.account : 'No account configured.' }}
  </md-list-item>
</md-list>
</div>
</template>

<script>
export default {
  name: 'rightDrawer',
  data: function () {
    return {
      provider: this.$store.state.web3provider
    }
  },
  watch: {
    provider: function (n, o) {
      console.log('provider ', n, o)
      this.$store.dispatch('swapProvider', n)
    }
  },
  methods: {
    capitalize: (str) => {
      return str[0].toUpperCase() + str.slice(1)
    }
  }
}
</script>

<style scoped>
.item {
  max-width: 95%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.loading {
  margin: 10px;
}

.provider {
  margin: 20px;
  max-width: 90%;
}
</style>
