<template>
  <div class="events-container">
    <b-table
      v-if="events?.length > 0"
      ref="table"
      id="events-table"
      :per-page="perPage"
      stacked="md"
      hover
      :items="events"
      :fields="fields"
      :current-page="currentPage"
      @row-clicked="rowClicked"
    >
      <template #table-busy></template>

      <template #cell(id)="data">
        <div class="d-flex">
          {{ data.item.contract_tx_id }}
          <div
            class="flaticon-copy-to-clipboard small"
            v-clipboard="data.item.interactionId"
            v-clipboard:success="({ event }) => event.stopPropagation()"
            title="Copy to clipboard"
          ></div>
        </div>
      </template>

      <template #cell(message)="data">
        <div v-if="data.item.message" class="flaticon-check centered"></div>
        <div v-else class="flaticon-cross centered"></div>
      </template>

      <template #cell(actions)="data">
        <div v-if="!data.item._showDetails" class="flaticon-chevron-down" />
        <div v-else class="flaticon-chevron-up" />
      </template>

      <template slot="row-details" slot-scope="data"> Message: {{ data.item.message }} </template>
    </b-table>
    <b-pagination
      v-model="currentPage"
      :total-rows="rows"
      :per-page="perPage"
      aria-controls="events-table"
      align="center"
      use-router
      last-number
      first-number
    ></b-pagination>
  </div>
</template>

<script>
export default {
  name: 'ContractEvents',
  components: {},
  props: { events: Array },
  data() {
    return {
      currentPage: 1,
      perPage: 15,
      fields: [
        'id',
        'event',
        'timestamp',
        {
          key: 'message',
          label: 'message',
          thClass: 'text-center',
        },
        { key: 'actions', label: '' },
      ],
    };
  },
  computed: {
    rows() {
      return this.events.length;
    },
  },
  methods: {
    rowClicked(record) {
      this.$set(record, '_showDetails', !record._showDetails);
    },
  },
};
</script>

<style lang="scss" scoped>
.flaticon-chevron-down,
.flaticon-chevron-up {
  height: 15px;
  width: 15px;
  background-repeat: no-repeat;
}
.flaticon-check {
  height: 12px;
  width: 12px;
  filter: invert(47%) sepia(86%) saturate(460%) hue-rotate(56deg) brightness(108%) contrast(94%);

  &.centered {
    margin: 0 auto;
  }
}

.flaticon-cross {
  height: 12px;
  width: 12px;
  filter: invert(14%) sepia(48%) saturate(6784%) hue-rotate(338deg) brightness(107%) contrast(97%);

  &.centered {
    margin: 0 auto;
  }
}

.centered {
  margin: 0 auto;
}
</style>
