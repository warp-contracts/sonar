<template>
    <router-view />
</template>

<script>
import { mapActions } from 'vuex';

export default {
    name: 'App',

    beforeMount() {
        const currentPath = this.$router.history.current.path;

        if (currentPath === '/' || currentPath === '/app') {
            this.$router.push('/app/contracts');
        }
    },
};
</script>

<style src="./styles/theme.scss" lang="scss" />
