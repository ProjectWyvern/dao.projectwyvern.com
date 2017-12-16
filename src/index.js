import Vue from 'vue'
import VueRouter from 'vue-router'
import VueMeta from 'vue-meta'
import VueMaterial from 'vue-material'
import VueMoment from 'vue-moment'
import 'vue-material/dist/vue-material.min.css'
import './styles.scss'

import App from './App.vue'
import routes from './routes.js'
import store from './store.js'

Vue.use(VueRouter)
Vue.use(VueMeta)
Vue.use(VueMaterial)
Vue.use(VueMoment)

const router = new VueRouter({ routes: routes, mode: 'history' })

/* eslint-disable no-new */
new Vue({
  store: store,
  router,
  el: '#app',
  render: h => h(App),
  components: { App }
})
