<template>
<div>
<md-toolbar class="md-transparent" md-elevation="0">
  <span class="md-title">Notifications</span>
  <div class="clearall">
    <md-button class="md-raised" v-on:click="clearAll()">
      Clear All
    </md-button>
  </div>
</md-toolbar>
<md-list>
  <md-list-item v-for="(n, index) in notifications" :key="index">
    <md-card class="notification">
      <md-card-header>
        <span class="md-subtitle">{{ format(n.type) }}</span>
        <md-progress-spinner class="spinner" v-if="!n.finalized" :md-diameter="20" :md-stroke="3" md-mode="indeterminate"></md-progress-spinner>
        <md-icon v-if="n.finalized" :class="'icon ' + n.status">{{ iconify(n.status) }}</md-icon>
      </md-card-header>
      <md-card-content>
      <div class="method">{{ n.abi.name }}</div>
      <div v-for="(param, index) in n.params" :key="index" class="param">
      {{ n.abi.inputs[index].name }} => {{ param }}
      </div>
      </md-card-content>
      <md-card-actions>
        <md-button v-on:click="viewTx(n.txHash)">View TX</md-button>
        <md-button v-on:click="clear(index)">Clear</md-button>
      </md-card-actions>
    </md-card>
  </md-list-item>
</md-list>
</div>
</template>

<script>
export default {
  name: 'notifications',
  methods: {
    iconify: function (status) {
      return ({
        warn: 'warning',
        error: 'error',
        ok: 'check_circle'
      })[status]
    },
    format: function (type) {
      return ({
        commitTx: 'Commit Transaction'
      })[type]
    },
    viewTx: function(txHash) {
      window.open('https://' + this.$store.state.web3.base.network + '.etherscan.io/tx/' + txHash)
    },
    clear: function(index) {
      this.$store.commit('clearNotification', index)
    },
    clearAll: function() {
      this.$store.commit('clearNotifications')
    }
  },
  computed: {
    notifications: function () {
      return this.$store.state.notifications;
    }
  }
}
</script>

<style scoped>
.clearall {
  right: 1em;
  position: absolute;
}

.notification {
  width: 100%;
}

.param {
  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.icon {
  left: 0.2em;
  position: relative;
  bottom: 0.15em;
}

.ok {
  color: green !important;
}

.warn {
  color: yellow !important;
}

.error {
  color: red !important;
}

.spinner {
  margin-left: 10px;
}
</style>
