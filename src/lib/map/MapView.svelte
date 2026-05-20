<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import { SERVICES } from '$config/services.config';
  import { visibleLayers, isVisible } from '$lib/stores/activeLayers';
  import { addWmsLayer, setLayerVisibility } from './wmsLayer';
  import { openPanel, setPanelResults } from '$lib/stores/panelStore';
  import { queryAtPoint } from '$lib/popup/featureInfo';

  let container: HTMLDivElement;
  let map: maplibregl.Map;
  let unsubscribe: (() => void) | undefined;

  onMount(() => {
    map = new maplibregl.Map({
      container,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [8.5, 48.4],
      zoom: 8,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right');

    map.on('load', () => {
      const current = get(visibleLayers);
      for (const service of SERVICES) {
        for (const layer of service.layers) {
          addWmsLayer(map, service, layer, isVisible(current, service.id, layer.name));
        }
      }
    });

    map.on('click', async (e) => {
      const { lng, lat } = e.lngLat;
      const bounds = map.getBounds();
      const container = map.getContainer();
      const vp = {
        bbox: `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`,
        width: container.clientWidth,
        height: container.clientHeight,
        x: Math.round(e.point.x),
        y: Math.round(e.point.y),
      };
      openPanel(lng, lat);
      const entries = await queryAtPoint(lng, lat, vp);
      setPanelResults(entries);
    });

    map.getCanvas().style.cursor = 'crosshair';

    // Subscribe to store – fires whenever a checkbox is toggled
    unsubscribe = visibleLayers.subscribe(current => {
      if (!map?.loaded()) return;
      for (const service of SERVICES) {
        for (const layer of service.layers) {
          setLayerVisibility(map, service.id, layer.name, isVisible(current, service.id, layer.name));
        }
      }
    });
  });

  onDestroy(() => {
    unsubscribe?.();
    map?.remove();
  });
</script>

<div bind:this={container} class="map-container"></div>

<style>
  .map-container {
    width: 100%;
    height: 100%;
  }
</style>
