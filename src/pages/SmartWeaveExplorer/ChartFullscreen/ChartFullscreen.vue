<template>
  <div class="fullscreen-wrapper" style="marginBottom: 30px;">
    <div style="width: 100%; height: 100%;">
      <a :href="returnUrl">
        <div class="d-flex mb-2">
          <div class="flaticon-chevron-left" />
          <div>Return</div>
        </div>
      </a>
      <h1 class="title">{{ title }}</h1>
      <div style="height: calc(100% - 70px); width: 100%;">
        <Charts :gatewayUrl="gatewayUrl" :statsPerDay="perDay" :title="title" :fullscreen="true" />
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import axios from 'axios';
import Charts from '@/components/Charts/Charts';
import constants from '@/constants';

export default {
  name: 'Fullscreen',
  components: { Charts },
  data() {
    return {
      contractsPerDay: null,
      interactionsPerDay: null,
    };
  },
  computed: {
    ...mapState('prefetch', ['gatewayUrl']),
    perDay() {
      return this.$route.params.id == 'contracts' ? this.contractsPerDay : this.interactionsPerDay;
    },
    title() {
      return this.$route.params.id == 'contracts' ? 'Contracts' : 'Interactions';
    },
    returnUrl() {
      return this.gatewayUrl == constants.gatewayProdUrl ? '/' : '/#/app/contracts?network=testnet';
    },
  },
  async mounted() {
    axios.get(`${this.gatewayUrl}/gateway/stats/per-day`).then((fetchedData) => {
      this.contractsPerDay = fetchedData.data.contracts_per_day;
      this.interactionsPerDay = fetchedData.data.interactions_per_day;
    });
  },
};
</script>

<style src="./ChartFullscreen.scss" lang="scss"></style>
