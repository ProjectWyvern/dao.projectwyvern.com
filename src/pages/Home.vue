<template>
<div>
<p>
{{ $store.state.web3.account === null ? 'No accounts found.' : 'Authenticated through web3 with account ' + $store.state.web3.account + '.' }}
</p>
<p>
{{ $store.state.web3.myTokens === 0 ? 'No tokens held.' : $store.state.web3.myTokens + ' WYV tokens held; ' + (100 * $store.state.web3.myTokens / $store.state.web3.totalTokens) + '% of total supply.' }}
</p>
<p>
(show open proposals not yet voted on)
</p>
</div>
</template>

<script>
export default {
  metaInfo: {
    title: 'Home'
  }
}
</script>
