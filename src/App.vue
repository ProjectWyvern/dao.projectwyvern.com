<template>
  <div class="page-container">
    <md-app>
      <md-app-toolbar class="md-primary">
        <img src="img/logo-square-red-transparent-200x200.png" class="logo" />
        <h3 class="md-title">Wyvern Distributed Autonomous Organization</h3>
        <h2 class="md-title" style="opacity: 0.5">Alpha Release</h2>
        <div class="md-toolbar-section-end">
          <md-button @click="showRightDrawer = !showRightDrawer">Network Configuration</md-button>
        </div>
      </md-app-toolbar>
      <md-app-drawer md-permanent="clipped">
        <md-list>
          <router-link v-for="(item, index) in links" :key="index" :to="item.path">
            <md-list-item>
              <md-icon>{{item.icon}}</md-icon>
              <span class="md-list-item-text">{{item.name}}</span>
            </md-list-item>
          </router-link>
        </md-list>
      </md-app-drawer> 
      <md-app-drawer class="md-right" :md-active.sync="showRightDrawer">
        <RightDrawer />
      </md-app-drawer>
      <md-app-content>
      <router-view></router-view>
      </md-app-content>
    </md-app>
  </div>
</template>

<script>
import RightDrawer from './components/RightDrawer'

export default {
  name: 'app',
  components: { RightDrawer },
  metaInfo: {
    title: '',
    titleTemplate: 'Wyvern DAO • %s'
  },
  data: function() {
    return {
      showRightDrawer: false,
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
}

.md-app-container {
  overflow-x: hidden;
}
</style>

<style scoped>
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
</style>
