module.exports = (options, req) => ({
  transformModules: ['ipfs-api', 'cids', 'multihashes', 'is-ipfs', 'ipld-dag-pb', 'multiaddr', 'multihashing-async', 'peer-id', 'libp2p-crypto', 'web3', 'asn1.js',
    'multicodec', 'ipfs-block', 'multibase', 'ipfs-unixfs', 'libp2p-crypto-secp256k1', 'peer-info'],
  entry: './src/index.js',
  html: {
    title: 'Wyvern DAO',
    description: 'Decentralized autonomous organization responsible for governing the Wyvern Exchange',
    template: 'src/index.ejs'
  },
  webpack (config) {
    config.module.noParse = []
    config.module.noParse.push(/dtrace-provider$/)
    config.module.noParse.push(/safe-json-stringify$/)
    config.node = {fs: 'empty'}
    return config
  }
})
