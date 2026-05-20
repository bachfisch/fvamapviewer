<script lang="ts">
  import '../app.css';
  import MapView from '$lib/map/MapView.svelte';
  import Sidebar from '$lib/sidebar/Sidebar.svelte';
  import Panel from '$lib/popup/Panel.svelte';

  let sidebarCollapsed = $state(false);
</script>

<svelte:head>
  <title>FVA Geo-Viewer BW</title>
</svelte:head>

<div class="layout">
  <Sidebar bind:collapsed={sidebarCollapsed} />
  <main class="map-wrapper">
    <MapView />
    <Panel />
  </main>
</div>

<style>
  .layout {
    display: flex;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .map-wrapper {
    flex: 1;
    position: relative;
    overflow: hidden;
  }
</style>
