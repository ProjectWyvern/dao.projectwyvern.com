import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import VuexPersistence from 'vuex-persist'

import { logger } from './logging.js'
import { web3Actions, track, bind } from './aux.js'

Vue.use(Vuex)

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  reducer: state => ({ notifications: state.notifications, web3provider: state.web3provider })
})

const state = {
  notifications: [],
  web3: {},
  web3error: null,
  web3provider: 'https://kovan.infura.io/8jK7Ap7Z0o5ZfSZ5dyv6'
}

const getters = {
}

var actions = {}

var provider = state.web3provider
try {
  provider = JSON.parse(window.localStorage.vuex).web3provider
} catch (err) {
  logger.warn({ extra: { err } }, 'Could not parse provider from localStorage')
}

actions = Object.assign(actions, web3Actions(provider))

const mutations = {
  setWeb3: (state, web3) => {
    Vue.set(state, 'web3', web3)
  },
  setWeb3Error: (state, error) => {
    logger.warn({ extra: error }, 'Web3 threw error')
    Vue.set(state, 'web3error', error)
  },
  clearWeb3Error: (state) => {
    Vue.set(state, 'web3error', null)
  },
  commitTx: (state, { txHash, abi, params }) => {
    logger.info({ extra: { txHash, params } }, 'Transaction committed')
    state.notifications.splice(0, 0, {
      type: 'commitTx',
      status: 'warn',
      finalized: false,
      txHash: txHash,
      abi: abi,
      params: params
    })
  },
  mineTx: (state, { txHash, success }) => {
    logger.info({ extra: { txHash, success } }, 'Transaction mined')
    const m = state.notifications.map((n, i) => [n, i]).filter(m => m[0].txHash === txHash)[0]
    const n = m[0]
    const i = m[1]
    Vue.set(n, 'status', success ? 'ok' : 'error')
    Vue.set(n, 'finalized', true)
    Vue.set(state.notifications, i, n)
  },
  clearNotification: (state, index) => {
    state.notifications.splice(index, 1)
  },
  clearNotifications: (state) => {
    Vue.set(state, 'notifications', [])
  },
  setProvider: (state, url) => {
    Vue.set(state, 'web3provider', url)
  }
}

var plugins = [vuexLocal.plugin]

if (process.env.NODE_ENV !== 'production') {
  plugins.push(createLogger())
}

const store = new Vuex.Store({ state, getters, actions, mutations, plugins })

const web3 = bind(store, {})

store.state.notifications.filter(n => !n.finalized).map(n => {
  const hash = n.txHash
  track(web3, hash, (success) => {
    store.commit('mineTx', { txHash: hash, success: success })
  })
})

export default store
