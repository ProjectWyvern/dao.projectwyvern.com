/* global location: false */

import Promise from 'bluebird'
import BigNumber from 'bignumber.js'
import _ from 'lodash'
import { Buffer } from 'buffer'
import Web3 from 'web3'
import ipfsAPI from 'ipfs-api'
import Vue from 'vue'

import { logger } from './logging.js'

import TestDAO from './wyvern-ethereum/build/contracts/TestDAO.json'
import TestToken from './wyvern-ethereum/build/contracts/TestToken.json'

const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }
      resolve(res)
    })
  )

var txCallbacks = {}

export const track = (web3, txHash, onConfirm) => {
  if (txCallbacks[txHash]) {
    txCallbacks[txHash].push(onConfirm)
  } else {
    txCallbacks[txHash] = [onConfirm]
    const poll = async () => {
      const tx = await promisify(c => web3.eth.getTransaction(txHash, c))
      if (tx.blockHash) {
        const receipt = await promisify(c => web3.eth.getTransactionReceipt(txHash, c))
        const status = parseInt(receipt.status) === 1
        txCallbacks[txHash].map(f => f(status))
        delete txCallbacks[txHash]
      } else {
        setTimeout(poll, 1000)
      }
    }
    poll()
  }
}

const wrapAction = (func) => {
  return async (fst, snd) => {
    try {
      await func(fst, snd)
    } catch (err) {
      const { commit } = fst
      commit('setWeb3Error', err.message)
    }
  }
}

const assertReady = (state) => {
  if (!state.web3.ready) throw new Error('Attempted to execute action prior to web3 sync, please wait')
}

const wrapSend = (web3, method, abi, gasLimit) => {
  return async ({ state, commit }, { params, onTxHash, onConfirm }) => {
    assertReady(state)
    await promisify(method.apply(this, params).call)
    const txHash = await promisify(c => method.apply(this, params).send({from: state.web3.base.account, gasLimit: gasLimit}, c))
    commit('commitTx', { txHash: txHash, abi: abi, params: params })
    onTxHash(txHash)
    track(web3, txHash, (success) => {
      commit('mineTx', { txHash: txHash, success: success })
      onConfirm()
    })
  }
}

export const web3Actions = (provider) => {
  const web3 = new Web3(new Web3.providers.HttpProvider(provider))
  const DAO = new web3.eth.Contract(TestDAO.abi, TestDAO.networks[42].address)
  const Token = new web3.eth.Contract(TestToken.abi, TestToken.networks[42].address)
  const ipfs = ipfsAPI({host: 'ipfs.infura.io', protocol: 'https'})
  const methodAbi = (c, m) => {
    return c.abi.filter(f => f.name === m)[0]
  }
  return {
    approve: wrapAction(wrapSend(web3, Token.methods.approve, methodAbi(TestToken, 'approve'), 250000)),
    setDelegateAndLockTokens: wrapAction(wrapSend(web3, DAO.methods.setDelegateAndLockTokens, methodAbi(TestDAO, 'setDelegateAndLockTokens'), 250000)),
    clearDelegateAndUnlockTokens: wrapAction(wrapSend(web3, DAO.methods.clearDelegateAndUnlockTokens, methodAbi(TestDAO, 'clearDelegateAndUnlockTokens'), 250000)),
    vote: wrapAction(wrapSend(web3, DAO.methods.vote, methodAbi(TestDAO, 'vote'), 250000)),
    createProposal: wrapAction(async ({ state, commit }, { title, description, address, amount, bytecode, onTxHash, onConfirm }) => {
      const wei = web3.utils.toWei(amount, 'ether')
      if (bytecode === 'null') bytecode = '0x'
      const json = {title: title, description: description, bytecode: bytecode, version: 1}
      const res = await ipfs.files.add(Buffer.from(JSON.stringify(json)))
      const hash = '0x' + Buffer.from(res[0].hash).toString('hex')
      return wrapSend(web3, DAO.methods.newProposal, methodAbi(TestDAO, 'newProposal'), 500000)(
        { state, commit },
        { params: [address, wei, hash, bytecode], onTxHash: onTxHash, onConfirm: onConfirm }
      )
    }),
    swapProvider: ({ state, commit }, url) => {
      commit('setProvider', url)
      location.reload()
    }
  }
}

export const bind = (store, bindings) => {
  const web3 = new Web3(new Web3.providers.HttpProvider(store.state.web3provider))
  const ipfs = ipfsAPI({host: 'ipfs.infura.io', protocol: 'https'})

  const DAO = new web3.eth.Contract(TestDAO.abi, TestDAO.networks[42].address)
  const Token = new web3.eth.Contract(TestToken.abi, TestToken.networks[42].address)

  var blockNumber

  const poll = async () => {
    const start = Date.now()
    const newBlockNumber = await promisify(web3.eth.getBlockNumber)
    const inter = Date.now()
    const latency = (inter - start) / 1000
    Vue.set(store.state.web3, 'latency', latency)
    if (newBlockNumber === blockNumber) return
    blockNumber = newBlockNumber
    const accounts = await promisify(web3.eth.getAccounts)
    const network = await promisify(web3.eth.net.getNetworkType)
    const account = accounts[0] ? accounts[0] : null
    const balance = account ? await promisify(c => web3.eth.getBalance(account, c)) : 0
    const base = { account: account, blockNumber: blockNumber, network: network, balance: new BigNumber(balance) }

    var token
    {
      const supply = await promisify(Token.methods.totalSupply().call)
      const decimals = await promisify(Token.methods.decimals().call)
      const symbol = await promisify(Token.methods.symbol().call)
      const balance = account ? await promisify(Token.methods.balanceOf(account).call) : 0
      var events = await promisify(c => Token.getPastEvents('allEvents', {fromBlock: 0}, c))
      events = events.map(e => {
        if (e.returnValues.numberOfTokens) e.returnValues.numberOfTokens = new BigNumber(e.returnValues.numberOfTokens)
        return e
      })
      events.reverse()
      token = {
        multiplier: new BigNumber(Math.pow(10, decimals)),
        supply: new BigNumber(supply),
        decimals: new BigNumber(decimals),
        symbol: symbol,
        balance: new BigNumber(balance),
        events: events
      }
    }

    var dao
    {
      const minimumQuorum = await promisify(DAO.methods.minimumQuorum().call)
      const debatingPeriodInMinutes = await promisify(DAO.methods.debatingPeriodInMinutes().call)
      const numProposals = await promisify(DAO.methods.numProposals().call)
      const sharesTokenAddress = await promisify(DAO.methods.sharesTokenAddress().call)
      const totalLockedTokens = await promisify(DAO.methods.totalLockedTokens().call)
      const requiredSharesToBeBoardMember = await promisify(DAO.methods.requiredSharesToBeBoardMember().call)
      const delegatesByDelegator = account ? await promisify(DAO.methods.delegatesByDelegator(account).call) : null
      const lockedDelegatingTokens = account ? await promisify(DAO.methods.lockedDelegatingTokens(account).call) : 0
      const delegatedAmountsByDelegate = account ? await promisify(DAO.methods.delegatedAmountsByDelegate(account).call) : 0
      var proposals = await Promise.all(_.range(numProposals).map(n => promisify(DAO.methods.proposals(n).call)))
      proposals = await Promise.all(proposals.map(async function (p, index) {
        const hash = Buffer.from(p.metadataHash.slice(2), 'hex').toString()
        var metadata = await promisify(c => ipfs.files.cat(hash, c))
        metadata = JSON.parse(metadata.toString())
        const { yea, nay, quorum } = await promisify(DAO.methods.countVotes(index).call)
        return {
          yea: new BigNumber(yea),
          nay: new BigNumber(nay),
          quorum: new BigNumber(quorum),
          recipient: p.recipient,
          metadata: metadata,
          amount: new BigNumber(p.amount),
          metadataHash: p.metadataHash,
          timeCreated: parseInt(p.timeCreated),
          votingDeadline: parseInt(p.votingDeadline),
          executed: p.executed,
          proposalPassed: p.proposalPassed,
          numberOfVotes: new BigNumber(p.numberOfVotes)
        }
      }))
      events = await promisify(c => DAO.getPastEvents('allEvents', {fromBlock: 0}, c))
      events = events.map(e => {
        if (e.returnValues.numberOfTokens) e.returnValues.numberOfTokens = new BigNumber(e.returnValues.numberOfTokens)
        return e
      })
      events.reverse()
      dao = {
        address: TestDAO.networks[42].address,
        minimumQuorum: new BigNumber(minimumQuorum),
        debatingPeriodInMinutes: parseInt(debatingPeriodInMinutes),
        numProposals: parseInt(numProposals),
        sharesTokenAddress: sharesTokenAddress,
        totalLockedTokens: new BigNumber(totalLockedTokens),
        requiredSharesToBeBoardMember: new BigNumber(requiredSharesToBeBoardMember),
        delegatedAmountsByDelegate: new BigNumber(delegatedAmountsByDelegate),
        delegatesByDelegator: delegatesByDelegator === '0x0000000000000000000000000000000000000000' ? null : delegatesByDelegator,
        lockedDelegatingTokens: new BigNumber(lockedDelegatingTokens),
        proposals: proposals,
        events: events
      }
    }

    const ready = true
    const end = Date.now()
    const diff = (end - start) / 1000
    const obj = { base, token, dao, ready, latency, diff }
    logger.debug({ extra: { latency: latency, diff: diff } }, 'Reloaded state')
    store.commit('setWeb3', obj)
  }
  poll()
  setInterval(poll, 1000)
  return web3
}
