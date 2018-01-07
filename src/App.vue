<template>
  <div class="page-container">
    <md-app>
      <md-app-toolbar class="md-primary">
        <img src="/img/logo-square-red-transparent-200x200.png" class="logo" />
        <h3 class="md-title title">Wyvern Distributed Autonomous Organization</h3>
        <h2 class="md-title subtitle" style="opacity: 0.5">Live Beta</h2>
        <div class="md-toolbar-section-end">
          <md-button @click="showNotifications = !showNotifications">
            <span>Notifications</span>
            <span class="badge green">{{ greenNotificationCount }}</span>
            <span class="badge yellow">{{ yellowNotificationCount }}</span>
            <span class="badge red">{{ redNotificationCount }}</span>
          </md-button>
          <md-button @click="showRightDrawer = !showRightDrawer">Network Configuration</md-button>
        </div>
      </md-app-toolbar>
      <md-app-drawer md-permanent="clipped">
        <md-list>
          <router-link v-for="(item, index) in links" :key="index" :to="item.path">
            <md-list-item :class="(item.path === '/' ? item.path === activePath : activePath.indexOf(item.path) === 0) ? 'active' : ''">
              <md-icon>{{item.icon}}</md-icon>
              <span class="md-list-item-text">{{item.name}}</span>
            </md-list-item>
          </router-link>
        </md-list>
      </md-app-drawer> 
      <md-app-drawer class="md-right" :md-active.sync="showNotifications">
        <Notifications />
      </md-app-drawer>
      <md-app-drawer class="md-right" :md-active.sync="showRightDrawer">
        <RightDrawer />
      </md-app-drawer>
      <md-app-content>
      <router-view></router-view>
      </md-app-content>
    </md-app>
    <md-dialog-alert
    :md-active.sync="error"
    :md-content="$store.state.web3error"
    v-on:md-closed="clearError"
    md-confirm-text="OK" />
  </div>
</template>

<script>
import RightDrawer from './components/RightDrawer'
import Notifications from './components/Notifications'

export default {
  name: 'app',
  components: { RightDrawer, Notifications },
  metaInfo: {
    title: '',
    titleTemplate: 'Wyvern DAO • %s'
  },
  watch: {
    web3error (n, o) {
      if (n) this.error = true
    }
  },
  methods: {
    clearError: function() {
      this.$store.commit('clearWeb3Error')
    }
  },
  computed: {
    web3error: function() {
      return this.$store.state.web3error;
    },
    activePath: function() {
      return this.$route.path;
    },
    greenNotificationCount: function() {
      return this.$store.state.notifications.filter(n => n.status === 'ok').length;
    },
    yellowNotificationCount: function() {
      return this.$store.state.notifications.filter(n => n.status === 'warn').length;
    },
    redNotificationCount: function() {
      return this.$store.state.notifications.filter(n => n.status === 'error').length;
    }
  },
  data: function() {
    return {
      error: false,
      showRightDrawer: false,
      showNotifications: false,
      links: [
        { path: '/', name: 'Home', icon: 'home' },
        { path: '/proposals', name: 'Proposals', icon: 'assignment' },
        { path: '/assets', name: 'Assets', icon: 'money' },
        { path: '/shareholders', name: 'Shareholders', icon: 'domain' },
        { path: '/delegates', name: 'Delegates', icon: 'people' },
        { path: '/help', name: 'Help', icon: 'help' }
      ]
    }
  }
}
</script>

<style>
body {
  height: 100%;
  font-family: "Raleway", sans-serif !important;
}

.md-app-container {
  overflow-x: hidden;
}
</style>

<style scoped>
.title {
  font-variant: small-caps;
}

.subtitle {
  font-variant: small-caps;
}

.active {
  border-left: 10px solid #000;
}

.page-container {
  height: 100%;
}

.md-app {
  height: 100%;
}
  
.logo {
  height: 50px;
  width: 50px;
  margin-right: 10px;
}

.badge {
  margin-left: 0.2em;
  position: relative;
  bottom: 0.05em;
  padding-left: 5px;
  padding-right: 5px;
  border-radius: 20%;
  text-align: center;
  color: white;
  width: 1.5em;
  line-height: 1.4em;
  font-size: 1em;
  height: 1.5em;
}

.red {
  background: rgba(255, 0, 0, 0.7);
}

.yellow {
  background: rgba(255, 255, 0, 0.7);
}

.green {
  background: rgba(0, 255, 0, 0.7);
}
</style>
