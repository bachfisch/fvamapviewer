<script lang="ts">
  import { panelStore, closePanel } from '$lib/stores/panelStore';
  import { CATEGORIES } from '$config/services.config';
  import { parseKlimaResult } from './featureInfo';
  import type { PanelEntry, ServiceEntry, FernEntry, KlimaPoint } from './featureInfo';
  import KlimaSpeciesChart from '$lib/charts/KlimaSpeciesChart.svelte';

  function categoryLabel(id: string): string {
    return CATEGORIES.find(c => c.id === id)?.label ?? id;
  }

  function formatCoord(v: number, axis: 'lat' | 'lng'): string {
    const dir = axis === 'lat' ? (v >= 0 ? 'N' : 'S') : (v >= 0 ? 'O' : 'W');
    return `${Math.abs(v).toFixed(4)}° ${dir}`;
  }

  // ── Klima rendering helpers ──────────────────────────────────────────────

  function groupBySpecies(entry: ServiceEntry): Map<string, KlimaPoint[]> {
    const points = entry.results.map(parseKlimaResult);
    const map = new Map<string, KlimaPoint[]>();

    for (const p of points) {
      const key = p.speciesKey ?? '__none__';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }

    if (entry.service.scenarioRelative) {
      for (const pts of map.values()) {
        const base = pts.find(p => p.scenarioGroup === 'Heute')?.value ?? null;
        if (base === null) continue;
        for (const p of pts) {
          if (p.value !== null && p.scenarioGroup !== 'Heute') {
            p.value = base * (1 + p.value);
          }
        }
      }
    }

    return map;
  }

  function klimaMode(entry: ServiceEntry): 'species-scenario' | 'species-only' | 'scenario-only' {
    const points = entry.results.map(parseKlimaResult);
    const hasSpecies = points.some(p => p.speciesKey !== null);
    const hasScenario = points.some(p => p.order < 99);
    if (hasSpecies && hasScenario) return 'species-scenario';
    if (hasSpecies) return 'species-only';
    return 'scenario-only';
  }

  function speciesLabel(key: string): string {
    const labels: Record<string, string> = {
      buche: 'Buche', eiche: 'Eiche', fichte: 'Fichte', tanne: 'Tanne',
      bergahorn: 'Bergahorn', douglasie: 'Douglasie', waldkiefer: 'Waldkiefer',
      gesamt: 'Gesamt', buche_eiche: 'Buche/Eiche', tanne_douglasie: 'Tanne/Douglasie',
      kiefer_laerche: 'Kiefer/Lärche', andere_baumarten: 'Andere',
      __none__: '',
    };
    return labels[key] ?? key;
  }
</script>

{#if $panelStore.open}
  <aside class="panel">
    <header class="panel-header">
      <div>
        <div class="panel-title">Standortinfo</div>
        {#if $panelStore.lngLat}
          <div class="panel-coords">
            {formatCoord($panelStore.lngLat[1], 'lat')} &nbsp;
            {formatCoord($panelStore.lngLat[0], 'lng')}
          </div>
        {/if}
      </div>
      <button class="close-btn" onclick={closePanel} aria-label="Schließen">✕</button>
    </header>

    <div class="panel-body">
      {#if $panelStore.loading}
        <div class="loading">
          <span class="spinner"></span>
          Daten werden geladen…
        </div>
      {:else if $panelStore.entries.length === 0}
        <div class="empty">
          Kein Layer aktiv oder keine Daten an dieser Stelle.
        </div>
      {:else}
        {#each $panelStore.entries as entry}
          <!-- ── Fernerkundung ───────────────────────────────────────── -->
          {#if entry.kind === 'fernerkundung'}
            {@const fern = entry as FernEntry}
            <section class="result-section">
              <div class="section-category">Fernerkundung</div>
              <table class="fern-table">
                <tbody>
                  {#each fern.rows as row}
                    <tr>
                      <td class="fern-label">{row.service.label}</td>
                      <td class="fern-value">
                        {#if row.value !== null}
                          {row.value.toFixed(2)}
                        {:else}
                          <span class="no-data">–</span>
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </section>

          <!-- ── Klimafolgenforschung ───────────────────────────────── -->
          {:else if entry.kind === 'klima'}
            {@const klima = entry as ServiceEntry}
            {@const mode = klimaMode(klima)}
            <section class="result-section">
              <div class="section-category">{categoryLabel(klima.service.category)}</div>
              <div class="section-service">{klima.service.label}</div>

              {#if mode === 'species-scenario'}
                {@const speciesMap = groupBySpecies(klima)}
                {@const allVals = [...speciesMap.values()].flat().map(p => p.value).filter(v => v !== null) as number[]}
                {@const yDomain = allVals.length ? [Math.min(0, ...allVals), Math.max(...allVals)] as [number, number] : undefined}
                {#each [...speciesMap.entries()] as [key, points]}
                  <KlimaSpeciesChart title={speciesLabel(key)} {points} {yDomain} />
                {/each}

              {:else if mode === 'species-only'}
                <!-- Single chart, X = species -->
                {@const points = klima.results.map(r => {
                  const p = parseKlimaResult(r);
                  return { ...p, barLabel: p.speciesLabel ?? r.layer.label };
                })}
                <KlimaSpeciesChart title="" {points} />

              {:else}
                <!-- scenario-only (Buchdrucker): single chart, X = scenario -->
                {@const points = klima.results.map(parseKlimaResult)}
                <KlimaSpeciesChart title="" {points} />
              {/if}
            </section>

          <!-- ── Standard-Layer ─────────────────────────────────────── -->
          {:else}
            {@const std = entry as ServiceEntry}
            <section class="result-section">
              <div class="section-category">{categoryLabel(std.service.category)}</div>
              <div class="section-service">{std.service.label}</div>
              {#each std.results as result}
                {#if result.value !== null || result.properties}
                  <div class="std-result">
                    {#if std.service.layers.length > 1}
                      <div class="layer-name">{result.layer.label}</div>
                    {/if}
                    {#if result.properties && Object.keys(result.properties).length > 1}
                      <!-- Full feature: show properties table -->
                      <table class="props-table">
                        <tbody>
                          {#each Object.entries(result.properties) as [k, v]}
                            {#if v !== null && v !== ''}
                              <tr>
                                <td class="prop-key">{k}</td>
                                <td class="prop-val">{v}</td>
                              </tr>
                            {/if}
                          {/each}
                        </tbody>
                      </table>
                    {:else if result.value !== null}
                      <div class="single-value">{result.value.toFixed(2)}</div>
                    {:else}
                      <div class="single-value">vorhanden</div>
                    {/if}
                  </div>
                {:else}
                  <div class="no-data-layer">Keine Daten an dieser Stelle</div>
                {/if}
              {/each}
            </section>
          {/if}
        {/each}
      {/if}
    </div>
  </aside>
{/if}

<style>
  .panel {
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 100%;
    background: var(--color-surface);
    border-left: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    z-index: 10;
    overflow: hidden;
    box-shadow: -2px 0 8px rgba(0,0,0,0.08);
  }

  .panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  .panel-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--color-text);
  }

  .panel-coords {
    font-size: 11px;
    color: var(--color-text-muted);
    margin-top: 2px;
    font-variant-numeric: tabular-nums;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: var(--color-text-muted);
    padding: 2px 4px;
    line-height: 1;
  }

  .close-btn:hover { color: var(--color-text); }

  .panel-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .loading, .empty {
    padding: 24px 16px;
    font-size: 13px;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .result-section {
    padding: 12px 16px 8px;
    border-bottom: 1px solid var(--color-border);
  }

  .section-category {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-primary);
    margin-bottom: 2px;
  }

  .section-service {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 10px;
  }

  .layer-name {
    font-size: 11px;
    color: var(--color-text-muted);
    margin-bottom: 2px;
  }

  /* Fernerkundung table */
  .fern-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    margin-top: 4px;
  }

  .fern-table td {
    padding: 4px 0;
    vertical-align: top;
  }

  .fern-label {
    color: var(--color-text);
    padding-right: 12px;
    width: 70%;
  }

  .fern-value {
    color: var(--color-text);
    font-variant-numeric: tabular-nums;
    text-align: right;
    white-space: nowrap;
  }

  /* Properties table for full features */
  .props-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    margin: 4px 0;
  }

  .props-table td {
    padding: 2px 0;
    vertical-align: top;
  }

  .prop-key {
    color: var(--color-text-muted);
    padding-right: 8px;
    width: 40%;
    word-break: break-all;
  }

  .prop-val {
    color: var(--color-text);
    font-variant-numeric: tabular-nums;
  }

  .single-value {
    font-size: 20px;
    font-weight: 600;
    color: var(--color-text);
    font-variant-numeric: tabular-nums;
    margin: 4px 0 8px;
  }

  .no-data {
    color: var(--color-text-muted);
  }

  .no-data-layer {
    font-size: 12px;
    color: var(--color-text-muted);
    margin: 4px 0;
  }

  .std-result {
    margin-bottom: 8px;
  }
</style>
