<script lang="ts">
  import type { CategoryMeta } from '$config/services.config';
  import { getServicesByCategory } from '$config/services.config';
  import LayerToggle from './LayerToggle.svelte';

  let { category }: { category: CategoryMeta } = $props();

  const services = $derived(getServicesByCategory(category.id));
  let open = $state(false);
</script>

<div class="category-group">
  <button class="category-header" onclick={() => (open = !open)} aria-expanded={open}>
    <span class="category-title">{category.label}</span>
    <span class="count">{services.length}</span>
    <span class="chevron" class:rotated={open}>▾</span>
  </button>

  {#if open}
    <div class="category-body">
      {#each services as service}
        <div class="service-block">
          {#if services.length > 1 || service.layers.length > 1}
            <div class="service-label">{service.label}</div>
          {/if}
          {#each service.layers as layer}
            <LayerToggle {service} {layer} />
          {/each}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .category-group {
    border-bottom: 1px solid var(--color-border);
  }

  .category-header {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 11px 16px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
    letter-spacing: 0.01em;
  }

  .category-header:hover {
    background: var(--color-bg);
  }

  .category-title {
    flex: 1;
  }

  .count {
    font-size: 11px;
    font-weight: 400;
    color: var(--color-text-muted);
    background: var(--color-border);
    border-radius: 10px;
    padding: 1px 7px;
  }

  .chevron {
    font-size: 14px;
    color: var(--color-text-muted);
    transition: transform 0.15s ease;
    display: inline-block;
  }

  .chevron.rotated {
    transform: rotate(180deg);
  }

  .category-body {
    padding: 4px 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .service-block {
    padding: 4px 0;
  }

  .service-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 4px;
    margin-top: 6px;
  }
</style>
