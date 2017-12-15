import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import VuexPersistence from 'vuex-persist'
import Web3 from 'web3'
import ipfsAPI from 'ipfs-api'
import { Buffer } from 'buffer'

import { bind } from './aux.js'

import TestDAO from './wyvern-ethereum/build/contracts/TestDAO.json'
import TestToken from './wyvern-ethereum/build/contracts/TestToken.json'

// const web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/8jK7Ap7Z0o5ZfSZ5dyv6'))
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

const DAO = new web3.eth.Contract(TestDAO.abi, TestDAO.networks[42].address)
const Token = new web3.eth.Contract(TestToken.abi, TestToken.networks[42].address)

const ipfs = ipfsAPI({host: 'ipfs.infura.io', protocol: 'https'})

Vue.use(Vuex)

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  reducer: state => ({ user: state.user })
})

const state = {
  proposals: [],
  web3: {
    network: null,
    blockNumber: 0,
    account: null,
    myTokens: 0,
    totalTokens: 0,
    numProposals: 0,
    totalLockedTokens: 0,
    delegate: null,
    delegatedAmount: 0
  }
}

const getters = {
}

const actions = {
  delegateShares: ({ state, commit }, { tokens, delegate, onTxHash, onConfirm }) => {
    Token.methods.approve(TestDAO.networks[42].address, tokens).send({from: state.web3.account, gasLimit: 250000}, (err, txHash) => {
      if (err) {
        console.log('err', err)
      } else {
        DAO.methods.setDelegateAndLockTokens(tokens, delegate).call((err, res) => {
          if (err) {
            console.log('sim err', err)
          } else {
            DAO.methods.setDelegateAndLockTokens(tokens, delegate).send({from: state.web3.account, gasLimit: 250000}, (err, txHash) => {
              console.log('res', err, txHash)
              onTxHash(txHash)
            })
          }
        })
      }
    })
  },
  undelegateShares: ({ state, commit }, { onTxHash, onConfirm }) => {
    DAO.methods.clearDelegateAndUnlockTokens().call((err, res) => {
      if (err) {
        console.log('sim err', err)
      } else {
        DAO.methods.clearDelegateAndUnlockTokens().send({from: state.web3.account, gasLimit: 250000}, (err, txHash) => {
          console.log('res', err, txHash)
          onTxHash(txHash)
        })
      }
    })
  },
  voteOnProposal: ({ state, commit }, { index, support, onTxHash, onConfirm }) => {
    DAO.methods.vote(index, support).call((err, res) => {
      if (err) {
        console.log('sim err', err)
      } else {
        DAO.methods.vote(index, support).send({from: state.web3.account, gasLimit: 250000}, (err, txHash) => {
          console.log('res', err, txHash)
          onTxHash(txHash)
        })
      }
    })
  },
  createProposal: ({ state, commit }, { title, description, address, amount, bytecode, onTxHash, onConfirm }) => {
    const wei = web3.utils.toWei(amount, 'ether')
    if (bytecode === 'null') bytecode = '0x'
    const json = {title: title, description: description, bytecode: bytecode, version: 1}
    ipfs.files.add(Buffer.from(JSON.stringify(json)), (err, res) => {
      if (err) {
        console.log('ipfs err! ', err, res, wei)
      } else {
        const hash = '0x' + Buffer.from(res[0].hash).toString('hex')
        DAO.methods.newProposal(address, wei, hash, bytecode).call((err, res) => {
          if (err) {
            console.log('sim err', err)
          } else {
            DAO.methods.newProposal(address, wei, hash, bytecode).send({from: state.web3.account, gasLimit: 1000000}, (err, txHash) => {
              console.log('res', err, txHash)
              onTxHash(txHash)
              // onConfirm()
            })
          }
        })
      }
    })
  }
}

const mutations = {
  setWeb3: (state, web3) => {
    Vue.set(state, 'web3', web3)
  }
}

var plugins = [vuexLocal.plugin]

if (process.env.NODE_ENV !== 'production') {
  plugins.push(createLogger())
}

const store = new Vuex.Store({ state, getters, actions, mutations, plugins })

bind(ipfs, web3, store, {})

export default store
