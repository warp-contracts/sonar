<template>
  <div :class="[{ root: true }, 'sing-dashboard']">
    <div class="wrap">
      <Header />
      <v-touch
        class="content"
        @swipe="handleSwipe"
        :swipe-options="{ direction: 'horizontal' }"
      >
        <transition name="router-animation">
          <router-view />
        </transition>
      </v-touch>
    </div>
  </div>
</template>

<script>
import { createNamespacedHelpers } from "vuex";
const { mapActions } = createNamespacedHelpers("layout");

import Header from "@/components/Header/Header";

import "./Layout.scss";

export default {
  name: "Layout",
  components: { Header },
  methods: {
    ...mapActions(["handleSwipe"]),
  },
};
</script>

<style src="./Layout.scss" lang="scss" />
