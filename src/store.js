import Vue from 'vue'
import Vuex from 'vuex'
import createLogger from 'vuex/dist/logger'
import VuexPersistence from 'vuex-persist'
import Web3 from 'web3'
import ipfsAPI from 'ipfs-api'
import { Buffer } from 'buffer'

import TestDAO from './wyvern-ethereum/build/contracts/TestDAO.json'
import TestToken from './wyvern-ethereum/build/contracts/TestToken.json'

// const web3 = new Web3(new Web3.providers.HttpProvider('https://kovan.infura.io/8jK7Ap7Z0o5ZfSZ5dyv6'))
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

const DAO = new web3.eth.Contract(TestDAO.abi, TestDAO.networks[42].address)
const Token = new web3.eth.Contract(TestToken.abi, TestToken.networks[42].address)

const ipfs = ipfsAPI({host: 'ipfs.infura.io', protocol: 'https'})

ipfs.version().then(console.log)

window.ipfs = ipfs
window.Buffer = Buffer

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
    numProposals: 0
  }
}

const getters = {
}

const actions = {
  createProposal: ({ state, commit }, { title, description, address, amount, bytecode, onTxHash, onConfirm }) => {
    console.log(title, description, address, amount, bytecode)
    const wei = web3.utils.toWei(amount, 'ether')
    if (bytecode === 'null') bytecode = '0x'
    const json = {title: title, description: description, version: 1}
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
  setProposal: (state, { index, proposal }) => {
    Vue.set(state.proposals, index, proposal)
  },
  setNumProposals: (state, numProposals) => {
    state.web3.numProposals = numProposals
  },
  setBlockNumber: (state, blockNumber) => {
    state.web3.blockNumber = blockNumber
  },
  setAccount: (state, account) => {
    state.web3.account = account
  },
  setTotalTokens: (state, tokens) => {
    state.web3.totalTokens = tokens
  },
  setMyTokens: (state, tokens) => {
    state.web3.myTokens = tokens
  }
}

var plugins = [vuexLocal.plugin]

if (process.env.NODE_ENV !== 'production') {
  plugins.push(createLogger())
}

const store = new Vuex.Store({ state, getters, actions, mutations, plugins })

const poll = () => {
  DAO.methods.minimumQuorum().call()

  DAO.methods.numProposals().call((err, count) => {
    if (!err) store.commit('setNumProposals', parseInt(count))

    for (var i = 0; i < count; i++) {
      const ind = i
      if (!store.state.proposals[ind]) {
        DAO.methods.proposals(ind).call((err, { amount, executed, numberOfVotes, proposalHash, recipient, votingDeadline, proposalPassed, metadataHash }) => {
          if (err) {
          } else {
            const hash = Buffer.from(metadataHash.slice(2), 'hex').toString()
            ipfs.files.cat(hash, (err, file) => {
              if (err) {
              } else {
                const metadata = JSON.parse(file.toString())
                store.commit('setProposal', { index: ind,
                  proposal: {
                    amount: amount,
                    executed: executed,
                    numberOfVotes: 0,
                    proposalHash: proposalHash,
                    proposalPassed: proposalPassed,
                    recipient: recipient,
                    votingDeadline: votingDeadline,
                    metadata: metadata
                  }
                })
              }
            })
          }
        })
      }
    }
  })

  Token.methods.totalSupply().call((err, supply) => {
    if (!err) store.commit('setTotalTokens', supply / Math.pow(10, 18))
  })

  if (store.state.web3.account) {
    Token.methods.balanceOf(store.state.web3.account).call((err, tokens) => {
      if (!err) store.commit('setMyTokens', tokens / Math.pow(10, 18))
    })
  }

  web3.eth.getBlockNumber((err, num) => {
    if (!err) {
      store.commit('setBlockNumber', num)
    }
  })
  web3.eth.getAccounts((err, accs) => {
    if (!err) {
      store.commit('setAccount', accs[0])
    }
  })
}

setTimeout(poll, 1000)
setInterval(poll, 5000)

export default store
