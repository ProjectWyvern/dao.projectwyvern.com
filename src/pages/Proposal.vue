<template>
<div>
<md-progress-bar md-mode="indeterminate" v-if="!$store.state.web3.ready" class="loading"></md-progress-bar>
<div v-if="$store.state.web3.ready">
<md-card class="proposal">
  <md-card-header>
    <div class="md-title">
    {{ proposal.metadata.title }}
    <div class="status">
    <md-button class="md-raised" disabled>{{ status }}</md-button>
    </div>
    </div>
    <div class="md-subhead">
    Send {{ proposal.amount.div($store.state.web3.token.multiplier).toNumber() }} Ether to {{ proposal.recipient }}. 
    <br />
    {{ proposal.numberOfVotes.toNumber() }} votes cast{{ over ? '.' : ' so far.' }} Voting {{ over ? 'ended' : 'ends' }} {{ new Date(1000 * proposal.votingDeadline) | moment('from', 'now')}}.
    <br />
    {{ proposal.yea.div($store.state.web3.token.multiplier).toNumber() }} shares {{ over ? 'voted' : 'are voting' }} yea and {{ proposal.nay.div($store.state.web3.token.multiplier).toNumber() }} shares {{ over ? 'voted' : 'are voting' }} nay.
    <br />
    That makes a total of {{ proposal.quorum.div($store.state.web3.token.multiplier).toNumber() }} votes, {{ percentQuorum }}% of the minimum quorum.
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
  <md-card-actions v-if="canVote && !voting">
    <md-button v-on:click="vote(true)">Vote Yea</md-button>
    <md-button v-on:click="vote(false)">Vote Nay</md-button>
  </md-card-actions>
  <md-card-actions v-else-if="voting">
    <md-progress-bar md-mode="indeterminate" class="voting"></md-progress-bar>
  </md-card-actions>
  <md-card-actions v-else-if="canFinalize">
    <md-button v-on:click="executeProposal">Execute Proposal</md-button>
  </md-card-actions>
</md-card>
</div>
<md-snackbar :md-active.sync="commit">Transaction committed!</md-snackbar>
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
      commit: false,
      voting: false
    }
  },
  methods: {
    vote: function(support) {
      const onTxHash = (txHash) => {
        this.commit = true
        this.voting = true
      }
      const onConfirm = () => {
        this.voting = false
      }
      this.$store.dispatch('vote', { params: [this.$route.params.id, support], onTxHash: onTxHash, onConfirm: onConfirm })
    },
    executeProposal: function() {
      const onTxHash = (txHash) => {
        this.commit = true
        this.voting = true
      }
      const onConfirm = () => {
        this.voting = false
      }
      this.$store.dispatch('executeProposal', { params: [this.$route.params.id, this.proposal.metadata.bytecode], onTxHash: onTxHash, onConfirm: onConfirm })
    }
  },
  computed: {
    over: function() {
      return (1000 * this.proposal.votingDeadline) <= Date.now();
    },
    percentQuorum: function() {
      var pct = this.proposal.quorum.div(this.$store.state.web3.dao.minimumQuorum).mul(100).toNumber()
      if (pct > 100) pct = 'over 100'
      else pct = '' + pct
      return pct
    },
    status: function() {
      return this.over ?
          (this.proposal.proposalPassed ? 'Passed' : 'Failed')
        : 'Voting';
    },
    canFinalize: function() {
      return this.over && !this.proposal.finalized;
    },
    canVote: function() {
      return this.$store.state.web3.base.account !== null && !this.proposal.hasVoted;
    },
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

.voting {
  margin-top: 15px;
  margin-bottom: 15px;
  width: 180px;
  float: right;
}

.status {
  font-size: 0.8em;
  float: right;
}
</style>
