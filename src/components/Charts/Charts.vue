<template>
  <div :key="gatewayUrl" class="chart">
    <v-chart :option="interactionsOption" :loading="loading" />
  </div>
</template>

<script>
import VChart, { LOADING_OPTIONS_KEY } from 'vue-echarts';
import dayjs from 'dayjs';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  GridComponent,
  DataZoomComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  GridComponent,
  DataZoomComponent,
]);
export default {
  name: 'Charts',
  props: {
    gatewayUrl: { type: String, default: null },
    statsPerDay: { type: Array, default: null },
    title: { type: String, default: null },
    fullscreen: { type: Boolean, default: false },
  },
  components: { VChart },
  provide: {
    [LOADING_OPTIONS_KEY]: {
      text: '',
      color: '#5982f1',
      textColor: '#000',
      maskColor: 'rgba(255, 255, 255, 0)',
      showSpinner: true,
    },
  },
  data() {
    return {
      interactionsOption: {
        tooltip: {
          trigger: 'axis',
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [],
          min: 100,
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: null,
        },
        dataZoom: [
          {
            type: 'slider',
            show: false,
            startValue: '',
            endValue: '',
            dataBackground: {
              lineStyle: {
                color: '#5982f1',
              },
              areaStyle: {
                color: '#5982f1',
                shadowColor: '#5982f1',
                opacity: 0.2,
              },
            },
          },
        ],
        series: [
          {
            name: this.title,
            type: 'line',
            data: [],
            lineStyle: { color: '#5982f1' },
          },
        ],
      },
      loading: true,
    };
  },
  watch: {
    async statsPerDay() {
      await this.loadStats();
    },
    async gatewayUrl() {
      await this.loadStats();
    },
  },
  methods: {
    toggle() {
      this.fullscreen = !this.fullscreen;
    },
    async loadStats() {
      this.loading = true;
      this.interactionsOption.xAxis.data = [];
      this.interactionsOption.series[0].data = [];
      await this.getStatsPerDay();
    },
    async getStatsPerDay() {
      this.fillChartWithData(this.statsPerDay, this.interactionsOption);
      this.loading = false;
    },
    fillChartWithData(data, option) {
      for (const options of data) {
        if (!options.date) {
          continue;
        }
        option.xAxis.data.push(dayjs(options.date).format('DD-MM-YYYY'));
        option.series[0].data.push(options.per_day);
      }
      option.dataZoom[0].startValue = dayjs(data[option.xAxis.data.length - (this.fullscreen ? 31 : 11)].date).format(
        'DD-MM-YYYY'
      );
      option.dataZoom[0].endValue = dayjs(data[option.xAxis.data.length - 1].date).format('DD-MM-YYYY');
      option.dataZoom[0].show = this.fullscreen ? true : false;
      this.interactionsOption.yAxis.max = Math.round(this.getBiggestData(data) / 100) * 100;
    },
    getBiggestData(data) {
      let sum = [];
      const last30Days = data.slice(-30);
      last30Days.forEach((d) => {
        sum.push(parseInt(d.per_day));
      });
      return sum.sort((a, b) => a - b).reverse()[0];
    },
  },
};
</script>

<style src="./Charts.scss" lang="scss"></style>
