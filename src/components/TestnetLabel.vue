<template>
  <div class="label"><p>testnet</p></div>
</template>

<script>
export default {
  name: 'TestnetLabel',

  data() {
    return {
      props: {
        isTestnet: Boolean,
      },
    };
  },
};
</script>

<style lang="scss" scoped>
.label {
position: absolute;
top: 1rem;
right: 1.5rem;

  width: 8rem;
  height: 2rem;

  display: flex;
  justify-content: center;
  align-items: center;

  background-color: var(--warp-blue-color);
  border-radius: 50rem;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;

  p {
    text-transform: uppercase;
    margin: 0;
    color: white;
    user-select: none;
  }
}

@media (max-width: 1024px) {
  .label {
    top: 0.5rem;
    right: 0.8rem;
  }
}
</style>
