<template>
  <div v-if="!correct">
    <Error />
  </div>
  <div v-else>creator component</div>
</template>

<script>
import { mapState } from 'vuex';
import Error from '@/components/Error/Error';

export default {
  name: 'Creator',

  data() {
    return {
      interactions: [],
      correct: false,
    };
  },
  components: {
    Error,
  },
  async mounted() {
    if (this.$route.params.id.length != 43) {
      this.correct = false;
    } else {
      this.correct = true;
    }

    this.getCreator();
  },
  methods: {
    async getCreator() {
      const response = await fetch(`${this.gatewayUrl}/gateway/creator?id=${this.contractId}`);
      if (!response.ok) {
        const error = `An error has occured: ${response.status}`;
        throw new Error(error);
      }
      const data = await response.json();
      console.log(data);
    },
  },

  computed: {
    ...mapState('prefetch', ['gatewayUrl', 'isTestnet']),
    contractId() {
      return this.$route.params.id;
    },
  },
};
</script>
