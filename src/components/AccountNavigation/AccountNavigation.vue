<template>
  <div class="acc-nav-container">
    <div class="triangle"></div>
    <p>Choose wallet</p>
    <div class="buttons-container">
      <b-button class="btn btn-modal rounded-pill" >Metamask</b-button>
      <b-button class="btn btn-modal rounded-pill" >Arconnect</b-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccountNavigation',
  components: {},
  props: {},
};
</script>

<style lang="scss" scoped>
$warp-blue: #5982f1;
.acc-nav-container {
  height: 24rem;
  width: 20rem;
  padding: 1rem;

  position: fixed;
  z-index: 999;
  top: 60px;
  right: 54px;

  display: flex;
  flex-direction: column;
  align-items: center;

  // glass effect
  background: rgba(89, 130, 241, 0.63);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5.6px);
  -webkit-backdrop-filter: blur(5.6px);
  border: 1px solid rgba(89, 130, 241, 0.05);

  .triangle {
    width: 80px;
    height: 50px;
    position: absolute;
    right: 10%;
    top: -51px;

    -webkit-clip-path: polygon(79% 76%, 33% 100%, 100% 100%);
    clip-path: polygon(79% 76%, 33% 100%, 100% 100%);
    background-color: $warp-blue;
    opacity: 0.7;
  }
  p {
    color: white;
    font-size: 1.2rem;
  }

  .buttons-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 80%;
  }
}
</style>
