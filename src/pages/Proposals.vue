<template>
<div>
<md-toolbar class="toolbar" md-elevation="0">
  <md-field class="search">
    <md-icon>search</md-icon>
    <md-input v-model="title" placeholder="Filter by title"></md-input>
  </md-field>
  <md-radio v-model="which" value="all">All</md-radio>
  <md-radio v-model="which" value="active">Active</md-radio>
  <md-radio v-model="which" value="inactive">Inactive</md-radio>
  <md-radio v-model="which" value="passed">Passed</md-radio>
  <md-radio v-model="which" value="failed">Failed</md-radio>
  <div class="md-toolbar-section-end" v-if="canCreateProposal">
    <router-link to="/proposals/create">
      <md-button class="md-raised md-primary">
        Create Proposal
        <md-icon>add</md-icon>
      </md-button>
    </router-link>
  </div>
</md-toolbar>
<md-progress-bar class="progressbar" md-mode="indeterminate" v-if="!$store.state.web3.ready" />
<div v-if="$store.state.web3.ready">
<md-card md-with-hover class="proposal" v-for="(proposal, index) in proposals" :key="proposal.proposalHash">
  <md-card-header>
    <router-link :to="'/proposals/' + proposal.index">
      <div class="md-title">{{ proposal.metadata.title }}</div>
      <div class="status"><md-button class="md-raised" disabled>{{ proposal.status }}</md-button></div>
    </router-link>
    <div class="md-subhead">
    Send {{ proposal.amount.div($store.state.web3.token.multiplier).toNumber() }} Ether to {{ proposal.recipient }}.
    <br />
    {{ proposal.numberOfVotes.toNumber() }} votes cast{{ proposal.finalized ? '.' : ' so far.' }} Voting {{ proposal.past ? 'ended' : 'ends' }} {{ new Date(1000 * proposal.votingDeadline) | moment('from', 'now')}}.
    </div>
  </md-card-header>
  <md-card-content>
    {{ proposal.metadata.description }}
  </md-card-content>
</md-card>
</div>
</div>
</template>

<script>
export default {
  metaInfo: {
    title: 'Proposals'
  },
  data: () => {
    return {
      title: '',
      which: 'all',
    }
  },
  computed: {
    canCreateProposal: function () {
      return this.$store.state.web3.ready && this.$store.state.web3.base.account !== null;
    },
    proposals: function () {
      return this.$store.state.web3.dao.proposals.map((p, num) => {
          p.index = num
          p.past = Date.now() > new Date(1000 * p.votingDeadline)
          p.status = p.finalized ? (p.proposalPassed ? 'Passed' : 'Failed') : (p.past ? 'Inactive' : 'Voting')
          return p
        }).filter(p => 
        (p.metadata.title.indexOf(this.title) !== -1) &&
        (this.which === 'all' ||
         (this.which === 'active' && !p.finalized && p.status !== 'Inactive') ||
         (this.which === 'inactive' && p.status === 'Inactive') ||
         (this.which === 'passed' && p.finalized && p.proposalPassed) ||
         (this.which === 'failed' && p.finalized && !p.proposalPassed))
      )
    }
  }
}
</script>

<style scoped>
.search {
  max-width: 500px;
  margin-right: 20px;
}

.proposal {
  margin: 10px;
}

.create {
  float: right;
}

.progressbar {
  margin-top: 10px;
}

.status {
  position: relative;
  bottom: 2.5em;
  font-size: 0.8em;
  float: right;
}
</style>
