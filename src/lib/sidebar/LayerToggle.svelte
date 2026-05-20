<script lang="ts">
  import type { ServiceConfig, WmsLayer } from '$config/services.config';
  import { visibleLayers, toggleLayer, isVisible } from '$lib/stores/activeLayers';

  let { service, layer }: { service: ServiceConfig; layer: WmsLayer } = $props();

  let visible = $derived(isVisible($visibleLayers, service.id, layer.name));
</script>

<label class="layer-toggle">
  <input
    type="checkbox"
    checked={visible}
    onchange={() => toggleLayer(service.id, layer.name)}
  />
  <span class="layer-label">{layer.label}</span>
  {#if layer.description}
    <span class="layer-desc">{layer.description}</span>
  {/if}
</label>

<style>
  .layer-toggle {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 4px 0;
    cursor: pointer;
    line-height: 1.4;
  }

  input[type="checkbox"] {
    margin-top: 2px;
    flex-shrink: 0;
    accent-color: var(--color-primary);
    width: 15px;
    height: 15px;
    cursor: pointer;
  }

  .layer-label {
    font-size: 13px;
    color: var(--color-text);
  }

  .layer-desc {
    display: block;
    font-size: 11px;
    color: var(--color-text-muted);
    margin-top: 1px;
  }
</style>
