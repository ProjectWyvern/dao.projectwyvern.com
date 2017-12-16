<template>
<div>
<md-progress-bar md-mode="indeterminate" v-if="!$store.state.web3.ready" class="loading"></md-progress-bar>
<div v-if="$store.state.web3.ready">
<md-card class="proposal">
  <md-card-header>
    <div class="md-title">{{ proposal.metadata.title }}</div>
    <div class="md-subhead">
    Send {{ proposal.amount }} Ether to {{ proposal.recipient }}. 
    <br />
    {{ proposal.numberOfVotes }} votes cast so far. Voting ends {{ new Date(1000 * proposal.votingDeadline) | moment('from', 'now')}}.
    <br />
    Currently {{ proposal.yea }} shares are voting yea and {{ proposal.nay }} shares are voting nay.
    </div>
  </md-card-header>
  <md-card-content>
    <md-field v-if="proposal.metadata.bytecode">
      <label>Bytecode</label>
      <md-textarea v-model="proposal.metadata.bytecode" readonly></md-textarea>
    </md-field>
    <p>
    {{ proposal.metadata.description }}
    </p>
  </md-card-content>
  <md-card-actions>
    <md-button v-on:click="vote(true)">Vote Yea</md-button>
    <md-button v-on:click="vote(false)">Vote Nay</md-button>
  </md-card-actions>
</md-card>
</div>
<md-snackbar :md-active.sync="voted">Transaction committed - {{ this.txHash }}!</md-snackbar>
</div>
</template>

<script>
export default {
  metaInfo: function() {
    return {
      title: 'Proposal ' + this.$route.params.id + (this.$store.state.web3.ready ? ' — ' + this.proposal.metadata.title : '')
    }
  },
  data: () => {
    return {
      voted: false,
      txHash: null
    }
  },
  methods: {
    vote: function(support) {
      const onTxHash = (txHash) => {
        this.voted = true
        this.txHash = txHash
      }
      const onConfirm = () => {}
      this.$store.dispatch('voteOnProposal', { index: this.$route.params.id, support: support, onTxHash: onTxHash, onConfirm: onConfirm })
    }
  },
  computed: {
    proposal: function() {
      return this.$store.state.web3.dao.proposals[this.$route.params.id];
    }
  }
}
</script>

<style scoped>
.loading {
  margin: 20px;
}
</style>
