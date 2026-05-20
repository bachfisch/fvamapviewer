<script lang="ts">
  import { CATEGORIES } from '$config/services.config';
  import CategoryGroup from './CategoryGroup.svelte';

  let { collapsed = $bindable(false) }: { collapsed?: boolean } = $props();
</script>

<aside class="sidebar" class:collapsed>
  <div class="sidebar-header">
    <div class="logo">
      <span class="logo-text">FVA Geo-Viewer</span>
      <span class="logo-sub">Baden-Württemberg</span>
    </div>
    <button class="collapse-btn" onclick={() => (collapsed = !collapsed)} title="Sidebar ein-/ausblenden">
      {collapsed ? '›' : '‹'}
    </button>
  </div>

  {#if !collapsed}
    <nav class="sidebar-nav">
      {#each CATEGORIES as category}
        <CategoryGroup {category} />
      {/each}
    </nav>

    <footer class="sidebar-footer">
      <p>Datenquelle: <a href="https://www.fva-bw.de/daten-tools/geodaten/geodatendienste" target="_blank" rel="noreferrer">FVA BW</a></p>
    </footer>
  {/if}
</aside>

<style>
  .sidebar {
    width: var(--sidebar-width);
    height: 100%;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    transition: width 0.2s ease;
    overflow: hidden;
  }

  .sidebar.collapsed {
    width: 40px;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  .logo {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
    overflow: hidden;
  }

  .logo-text {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-primary);
    white-space: nowrap;
  }

  .logo-sub {
    font-size: 10px;
    color: var(--color-text-muted);
    white-space: nowrap;
  }

  .collapse-btn {
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    color: var(--color-text-muted);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .collapse-btn:hover {
    background: var(--color-bg);
    color: var(--color-text);
  }

  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .sidebar-footer {
    padding: 10px 16px;
    border-top: 1px solid var(--color-border);
    font-size: 11px;
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  .sidebar-footer a {
    color: var(--color-primary);
    text-decoration: none;
  }

  .sidebar-footer a:hover {
    text-decoration: underline;
  }
</style>
