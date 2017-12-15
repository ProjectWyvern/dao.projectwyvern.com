import Promise from 'bluebird'
import BigNumber from 'bignumber.js'
import _ from 'lodash'
import bunyan from 'bunyan'
import { Buffer } from 'buffer'

import TestDAO from './wyvern-ethereum/build/contracts/TestDAO.json'
import TestToken from './wyvern-ethereum/build/contracts/TestToken.json'

function Stream () {}
Stream.prototype.write = function (rec) {
  console.log('%c%s %c%s %c%s %c%s %O',
      'color:green;',
      rec.time.toISOString(),
      'color:red;',
      rec.name,
      'color:blue;',
      bunyan.nameFromLevel[rec.level],
      'color:black;',
      rec.msg,
      rec.extra)
}

const logger = bunyan.createLogger({name: 'web3', streams: [{level: 'trace', stream: new Stream(), type: 'raw'}]})

const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }
      resolve(res)
    })
  )

export const bind = (ipfs, web3, store, bindings) => {
  const DAO = new web3.eth.Contract(TestDAO.abi, TestDAO.networks[42].address)
  const Token = new web3.eth.Contract(TestToken.abi, TestToken.networks[42].address)

  var blockNumber

  const poll = async () => {
    const start = Date.now()
    const newBlockNumber = await promisify(web3.eth.getBlockNumber)
    if (newBlockNumber === blockNumber) return
    blockNumber = newBlockNumber
    const accounts = await promisify(web3.eth.getAccounts)
    const network = await promisify(web3.eth.net.getNetworkType)
    const account = accounts[0]
    const balance = await promisify(c => web3.eth.getBalance(account, c))
    const base = { account: account, blockNumber: blockNumber, network: network, balance: new BigNumber(balance) }

    var token
    {
      const supply = await promisify(Token.methods.totalSupply().call)
      const decimals = await promisify(Token.methods.decimals().call)
      const symbol = await promisify(Token.methods.symbol().call)
      const balance = await promisify(Token.methods.balanceOf(account).call)
      token = { supply: new BigNumber(supply), decimals: new BigNumber(decimals), symbol: symbol, balance: new BigNumber(balance) }
    }

    var dao
    {
      const minimumQuorum = await promisify(DAO.methods.minimumQuorum().call)
      const debatingPeriodInMinutes = await promisify(DAO.methods.debatingPeriodInMinutes().call)
      const numProposals = await promisify(DAO.methods.numProposals().call)
      const sharesTokenAddress = await promisify(DAO.methods.sharesTokenAddress().call)
      const totalLockedTokens = await promisify(DAO.methods.totalLockedTokens().call)
      const requiredSharesToBeBoardMember = await promisify(DAO.methods.requiredSharesToBeBoardMember().call)
      const delegatesByDelegator = await promisify(DAO.methods.delegatesByDelegator(account).call)
      const lockedDelegatingTokens = await promisify(DAO.methods.lockedDelegatingTokens(account).call)
      const delegatedAmountsByDelegate = await promisify(DAO.methods.delegatedAmountsByDelegate(account).call)
      var proposals = await Promise.all(_.range(numProposals).map(n => promisify(DAO.methods.proposals(n).call)))
      proposals = await Promise.all(proposals.map(async function (p) {
        const hash = Buffer.from(p.metadataHash.slice(2), 'hex').toString()
        var metadata = await promisify(c => ipfs.files.cat(hash, c))
        metadata = JSON.parse(metadata.toString())
        return {
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
      var events = await promisify(c => DAO.getPastEvents('allEvents', {fromBlock: 0}, c))
      events = events.map(e => e)
      dao = {
        minimumQuorum: new BigNumber(minimumQuorum),
        debatingPeriodInMinutes: parseInt(debatingPeriodInMinutes),
        numProposals: parseInt(numProposals),
        sharesTokenAddress: sharesTokenAddress,
        totalLockedTokens: new BigNumber(totalLockedTokens),
        requiredSharesToBeBoardMember: new BigNumber(requiredSharesToBeBoardMember),
        delegatedAmountsByDelegate: new BigNumber(delegatedAmountsByDelegate),
        delegatesByDelegator: delegatesByDelegator,
        lockedDelegatingTokens: new BigNumber(lockedDelegatingTokens),
        proposals: proposals,
        events: events
      }
    }

    const obj = { base, token, dao }
    const end = Date.now()
    logger.debug({ extra: { diff: (end - start) / 1000 } }, 'Reloaded state')
    store.commit('setWeb3', obj)
  }
  poll()
  setInterval(poll, 1000)
}
