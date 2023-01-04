<template>
  <div class="events-container cursor-pointer">
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

      <template #cell(message)="data">
        <div v-if="data.item.message" class="flaticon-check centered"></div>
        <div v-else class="flaticon-cross centered"></div>
      </template>

      <template #cell(actions)="data">
        <div v-if="!data.item._showDetails" class="flaticon-chevron-down" />
        <div v-else class="flaticon-chevron-up" />
      </template>

      <template #cell(ago)="data">
        {{ timeAgo(data.item.timestamp) }}
      </template>

      <template slot="row-details" slot-scope="data">
        <div class="event-message" v-if="data.item.message">
          Message:
          {{ data.item.message }}
        </div>
        <div class="json-display">
          <json-viewer :value="data.item" :expand-depth="1" copyable sort theme="json-theme">
            <template v-slot:copy>
              <img
                v-b-tooltip.hover
                title="Copy JSON data"
                src="@/assets/icons/copy-to-clipboard.svg"
                class="jviewer-copy-icon"
                alt="copy icon"
              /> </template
          ></json-viewer>
        </div>
      </template>
    </b-table>
    <b-pagination
      v-model="currentPage"
      :total-rows="rows"
      :per-page="perPage"
      aria-controls="events-table"
      align="center"
      last-number
      first-number
    ></b-pagination>
  </div>
</template>

<script>
import JsonViewer from 'vue-json-viewer';
import ExportButton from '../../../../components/ExportButton.vue';
import dayjs from 'dayjs';

const duration = require('dayjs/plugin/duration');
dayjs.extend(duration);

export default {
  name: 'ContractEvents',
  components: { JsonViewer, ExportButton },
  props: { events: Array },
  data() {
    return {
      epochs: [
        ['year', 31536000],
        ['month', 2592000],
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
        ['second', 1],
      ],
      copiedDisplay: false,
      currentPage: 1,
      perPage: 15,
      fields: [
        'event',
        {
          key: 'message',
          label: 'message',
          thClass: 'text-center',
        },
        'ago',
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
    convertTZ(date, tzString) {
      return new Date(
        (typeof date === 'string' ? new Date(date) : date).toLocaleString('en-US', { timeZone: tzString })
      );
    },
    getDuration(timeAgoInSeconds) {
      for (let [name, seconds] of this.epochs) {
        const interval = Math.floor(timeAgoInSeconds / seconds);
        if (interval >= 1) {
          return {
            interval: interval,
            epoch: name,
          };
        }
      }
    },
    timeAgo(date, sortKeyTimestamp) {
      const timeAgoInSeconds = Math.floor(
        (this.convertTZ(new Date(), 'Europe/Berlin') -
          this.convertTZ(
            new Date(sortKeyTimestamp ? sortKeyTimestamp : date),
            sortKeyTimestamp ? 'Europe/Berlin' : 'Europe/London'
          )) /
          1000
      );
      const { interval, epoch } = this.getDuration(timeAgoInSeconds);
      const suffix = interval === 1 ? '' : 's';
      return `${interval} ${epoch}${suffix} ago`;
    },
    daysAgo(timestamp) {
      const difference = Math.trunc(+Date.now() / 1000) - timestamp;
      const daysDifference = Math.floor(difference / 60 / 60 / 24);

      return daysDifference;
    },
  },
};
</script>

<style lang="scss" scoped>
.json-display {
  position: relative;
}
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

.event-message {
  color: var(--warp-blue-color);
  margin: 1rem 0;
}

.centered {
  margin: 0 auto;
}

::v-deep #events-table tbody tr {
  cursor: pointer;
}
</style>
