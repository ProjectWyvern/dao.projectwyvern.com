<template>
<div>
<md-steppers :md-active-step.sync="active" md-linear>
  <md-step id="first" :md-done.sync="first" md-label="Process Overview">
  <br /><div class="md-subtitle">By submitting this form, you will create a proposal which suggests that the Wyvern DAO take a specific course of action by executing an Ethereum transaction.
  <br /><br />You must specify the exact transaction you wish the DAO to execute and describe the proposal in words so that other shareholders can decide whether or not to vote for it.
  <br /><br />Once submitted, your proposal will be voted on and executed (or not) according to the will of the DAO's shareholders.
  <br /><br />Construct your proposal carefully and read over it twice before you submit. Once submitted proposals cannot be edited.</div>
  <br />
  <md-button class="md-raised md-primary left" @click="setDone('first', 'second')">Continue</md-button>
  </md-step>
  <md-step id="second" :md-done.sync="second" md-label="Construct Transaction">
  <form novalidate class="md-layout-row md-gutter" @submit.prevent="validateTransaction">
    <div class="md-flex md-flex-small-100">
      <md-field :class="getValidationClass('address')">
        <label for="address">Ethereum address to which the transaction will be sent.</label>
        <md-input name="address" id="address" v-model="form.address" :disabled="sending" />
        <span class="md-error" v-if="!$v.form.address.required">The destination address is required</span>
        <span class="md-error" v-else-if="!$v.form.address.valid">Invalid address (enter in standard 0x-prefixed checksummed hex format)</span>
      </md-field>
    </div>
    <div class="md-flex md-flex-small-100">
      <md-field :class="getValidationClass('amount')">
        <label for="amount">Ether to send (0 if no Ether is to be sent).</label>
        <md-input type="number" id="amount" name="amount" v-model="form.amount" :disabled="sending" />
        <span class="md-error" v-if="!$v.form.amount.required">The amount is required</span>
        <span class="md-error" v-else-if="!$v.form.amount.maxlength">Invalid amount</span>
      </md-field>
    </div>
    <div class="md-flex md-flex-small-100">
      <md-field :class="getValidationClass('bytecode')">
        <label for="bytecode">Transaction Bytecode (null for none, 0x-prefixed hex-encoded otherwise)</label>
        <md-textarea name="bytecode" id="bytecode" v-model="form.bytecode" :disabled="sending" />
        <span class="md-error" v-if="!$v.form.bytecode.required">Transaction bytecode is required; enter the string "null" for an empty payload</span>
      </md-field>
    </div>
    <md-button type="submit" class="md-raised md-primary">Continue</md-button>
  </form>
  </md-step>
  <md-step id="third" :md-done.sync="third" md-label="Describe Proposal">
  <form novalidate class="md-layout-row md-gutter" @submit.prevent="validateDescription">
    <div class="md-flex md-flex-small-100">
      <md-field :class="getValidationClass('title')">
        <label for="title">Pick a title to summarize what this proposal will do.</label>
        <md-input name="title" id="title" v-model="form.title" :disabled="sending" />
        <span class="md-error" v-if="!$v.form.title.required">The title is required</span>
      </md-field>
    </div>
    <div class="md-flex md-flex-small-100">
      <md-field :class="getValidationClass('description')">
        <label for="description">Describe this proposal in detail, including references or links to external agreements as appropriate.</label>
        <md-textarea name="description" id="description" v-model="form.description" :disabled="sending" />
        <span class="md-error" v-if="!$v.form.description.required">A description is required</span>
      </md-field>
    </div>
    <md-button type="submit" class="md-raised md-primary">Continue</md-button>
  </form>
  </md-step>
  <md-step id="fourth" :md-done.sync="fourth" md-label="Review & Submit">
    <form novalidate class="md-layout-row md-gutter" @submit.prevent="validateProposal">
      <md-card class="proposal">
        <md-card-header>
          <div class="md-title">{{ form.title }}</div>
          <div class="md-subhead">
          Send {{ form.amount }} Ether to {{ form.address }}. 
          </div>
        </md-card-header>
        <md-card-content>
          <md-field>
            <label>Bytecode</label>
            <md-textarea v-model="form.bytecode" readonly></md-textarea>
          </md-field>
          <p> 
          {{ form.description }}
          </p>
        </md-card-content>
        <md-progress-bar md-mode="indeterminate" v-if="sending" />
        <md-card-actions>
          <md-button type="submit" class="md-primary" :disabled="sending">Create Proposal</md-button>
        </md-card-actions>
      </md-card>
    </form>
  </md-step>
</md-steppers>
<md-snackbar :md-active.sync="created">Transaction committed!</md-snackbar>
</div>
</template>

<script>
import { validationMixin } from 'vuelidate'
import {
  required,
  minLength,
  maxLength
} from 'vuelidate/lib/validators'

export default {
  name: 'CreateProposal',
  mixins: [validationMixin],
  data: () => {
    return {
      active: 'first',
      first: false,
      second: false,
      third: false,
      fourth: false,
      sending: false,
      created: false,
      form: {
        title: null,
        description: null,
        address: null,
        amount: null,
        bytecode: null
      }
    }
  },
  validations: {
    form: {
      title: { required: required },
      description: { required: required },
      address: { required: required },
      amount: { required: required },
      bytecode: { required: required }
    }
  },
  methods: {
    setDone (id, index) {
      this[id] = true
      if (index) {
        this.active = index
      }
    },
    getValidationClass (fieldName) {
      const field = this.$v.form[fieldName]

      if (field) {
        return {
          'md-invalid': field.$invalid && field.$dirty
        }
      }
    },
    createProposal() {
      const onTxHash = (txHash) => {
        this.sending = true
        this.created = true
      }
      const onConfirm = () => {
        this.sending = false
        this.$router.push('/proposals/' + (this.$store.state.web3.dao.numProposals))
      }
      this.$store.dispatch('createProposal', { title: this.form.title, description: this.form.description, address: this.form.address, amount: this.form.amount, bytecode: this.form.bytecode, onTxHash: onTxHash, onConfirm: onConfirm })
    },
    validateTransaction () {
      this.$v.$touch()
    
      if (!this.$v.form.bytecode.$invalid && !this.$v.form.address.$invalid && !this.$v.form.amount.$invalid) {
        this.setDone('second', 'third')
      }
    },
    validateDescription () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.setDone('third', 'fourth')
      }
    },
    validateProposal () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.createProposal()
      }
    }
  },
  metaInfo: {
    title: 'Create Proposal'
  }
}
</script>

<style scoped>
.left {
  position: relative;
  left: -10px;
}
</style>
