<script lang="ts">
  import * as Plot from '@observablehq/plot';
  import type { KlimaPoint } from '$lib/popup/featureInfo';

  let { points, title }: { points: KlimaPoint[]; title: string } = $props();

  let container: HTMLDivElement;

  const withValue = $derived(points.filter(p => p.value !== null));

  const sortedUnique = $derived.by(() => {
    const sorted = [...withValue].sort((a, b) =>
      a.groupOrder !== b.groupOrder ? a.groupOrder - b.groupOrder : a.order - b.order
    );
    const seen = new Set<string>();
    return sorted.filter(p => {
      if (seen.has(p.barLabel)) return false;
      seen.add(p.barLabel);
      return true;
    });
  });

  const groupEntries = $derived.by(() => {
    const map = new Map<string, { label: string; count: number }>();
    for (const p of sortedUnique) {
      const g = p.scenarioGroup;
      if (!map.has(g)) map.set(g, { label: g, count: 0 });
      map.get(g)!.count++;
    }
    return [...map.values()];
  });

  const showGroupAxis = $derived(groupEntries.length > 1);

  $effect(() => {
    if (!container) return;
    container.innerHTML = '';
    if (!sortedUnique.length) {
      container.textContent = 'Keine Daten';
      return;
    }

    const timePeriodMap = new Map(sortedUnique.map(p => [p.barLabel, p.timePeriod]));

    const chart = Plot.plot({
      width: 272,
      height: showGroupAxis ? 136 : 160,
      marginBottom: 44,
      marginLeft: 42,
      marginTop: 8,
      marginRight: 12,
      x: {
        domain: sortedUnique.map(p => p.barLabel),
        tickFormat: (d: string) => timePeriodMap.get(d) ?? d,
        tickRotate: -35,
        label: null,
        tickSize: 0,
      },
      y: {
        label: null,
        grid: true,
        tickCount: 4,
      },
      marks: [
        Plot.barY(sortedUnique, {
          x: 'barLabel',
          y: 'value',
          fill: (d: KlimaPoint) => d.color,
          title: (d: KlimaPoint) => `${d.timePeriod}: ${d.value?.toFixed(2)}`,
        }),
        Plot.ruleY([0], { stroke: '#ccc' }),
      ],
      style: {
        fontFamily: 'var(--font-sans)',
        fontSize: '10px',
        background: 'transparent',
      },
    });

    container.append(chart);
  });
</script>

<div class="species-chart">
  {#if title}
    <div class="species-title">{title}</div>
  {/if}
  {#if showGroupAxis && sortedUnique.length > 0}
    <div class="group-axis">
      <div class="group-axis-inner">
        {#each groupEntries as grp}
          <div class="group-label" style="flex: {grp.count}">
            {grp.label}
          </div>
        {/each}
      </div>
    </div>
  {/if}
  <div bind:this={container} class="chart-container"></div>
</div>

<style>
  .species-chart {
    margin-bottom: 12px;
  }

  .species-title {
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
    padding: 0 4px;
  }

  .chart-container {
    font-size: 10px;
    color: var(--color-text);
  }

  .group-axis {
    padding-left: 42px;
    padding-right: 12px;
    margin-top: -2px;
  }

  .group-axis-inner {
    display: flex;
    border-bottom: 1px solid var(--color-border);
  }

  .group-label {
    font-size: 9px;
    color: var(--color-text-muted);
    text-align: center;
    padding-bottom: 3px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    border-right: 1px solid var(--color-border);
    padding-left: 2px;
    padding-right: 2px;
  }

  .group-label:last-child {
    border-right: none;
  }
</style>
