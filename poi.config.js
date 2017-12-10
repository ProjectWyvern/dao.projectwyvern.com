module.exports = (options, req) => ({
  entry: './src/index.js',
  html: {
    title: 'Wyvern DAO',
    description: 'Decentralized autonomous organization responsible for governing the Wyvern Exchange',
    template: 'src/index.ejs'
  }
})
