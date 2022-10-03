<template>
  <BCard class="border-0">
    <div class="text-justify">
      <div class="d-flex intro">
        <div class="p-3">
          SmartWeave is a data-centered protocol built on top of the Arweave chain that allows to implement smart
          contracts. The key difference between SmartWeave and other similar solutions is that the contracts can be
          evaluated on-demand and "lazily".
        </div>
        <div class="p-3">
          <b-button
            class="btn-docs rounded-pill"
            target="_blank"
            href="https://github.com/warp-contracts/gateway#redstone-smartweave-gateway"
            >Check repository</b-button
          >
        </div>
      </div>
      <div class="p-3">
        <span class="info-colored">Warp SmartWeave Gateway</span> is a gateway dedicated to loading SmartWeave contract
        interactions. It firstly loads information about currently active peers and rank them by the amount of synced
        blocks and response times. It then loads and index SmartWeave interactions from the newly mined blocks in order
        to - finally - perform transactions confirmation. Each transaction must be confirmed by at least three nodes to
        obtain the 'confirmed' status. If it won't pass the test it will be tagged as 'corrupted' which means that it is
        not part of any block. Being aware of these confirmed and corrupted transactions gives the confidence of having
        reliable data and not exposing smart contracts to potential harmful incidents.
        <br />
        <br />
        <span class="info-colored">Redstone SmartWeave Gateway</span> is a fast and dependable resource which addresses
        critical problems of loading interactions. It's an open source project which can be used by anyone willing to
        spin up their own instance of the gateway dedicated to serving its contracts' interactions.
      </div>
    </div>
  </BCard>
</template>

<script>
export default {
  name: 'Modal',
};
</script>
<style src="./Modal.scss" lang="scss" />
