#!/usr/bin/env node
/**
 * FVA Viewer – Capabilities Fetcher
 *
 * Ruft GetCapabilities aller konfigurierten WMS-Dienste ab und gibt
 * die verfügbaren Layer-Namen aus. Lokal ausführen mit:
 *
 *   npx tsx scripts/fetch-capabilities.ts
 *   npx tsx scripts/fetch-capabilities.ts --service klima-buchdrucker
 *   npx tsx scripts/fetch-capabilities.ts --json > docs/capabilities.json
 *
 * Voraussetzungen:
 *   npm install tsx
 */

import { SERVICES, getWmsUrl, type ServiceConfig, type WmsLayer } from "../src/config/services.config";

const OWS_BASE = "https://owsproxy.lgl-bw.de/owsproxy/ows";
const args = process.argv.slice(2);
const filterService = args.includes("--service")
  ? args[args.indexOf("--service") + 1]
  : null;
const outputJson = args.includes("--json");

// ---------------------------------------------------------------------------

interface LayerInfo {
  name: string;
  title: string;
  abstract?: string;
  queryable: boolean;
}

interface ServiceResult {
  serviceId: string;
  wmsService: string;
  layers: LayerInfo[];
  error?: string;
}

async function fetchCapabilities(service: ServiceConfig): Promise<ServiceResult> {
  const url = `${OWS_BASE}/${service.wmsService}?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const xml = await res.text();

    // Parse XML – Node hat keinen DOM Parser, daher simples Regex-basiertes Parsing
    // Für Produktion: xml2js oder fast-xml-parser nutzen
    const layers: LayerInfo[] = [];

    // Alle <Layer queryable="1"> oder <Layer> Blöcke finden
    const layerRegex = /<Layer(\s[^>]*)?>[\s\S]*?<\/Layer>/g;
    let match: RegExpExecArray | null;

    while ((match = layerRegex.exec(xml)) !== null) {
      const block = match[0];

      // Nur Layer mit <Name> (keine Gruppen-Layer ohne Name)
      const nameMatch = block.match(/<Name>([^<]+)<\/Name>/);
      if (!nameMatch) continue;

      const titleMatch = block.match(/<Title>([^<]+)<\/Title>/);
      const abstractMatch = block.match(/<Abstract>([^<]+)<\/Abstract>/);
      const queryable = /queryable="1"/.test(match[1] ?? "");

      layers.push({
        name: nameMatch[1].trim(),
        title: titleMatch ? titleMatch[1].trim() : nameMatch[1].trim(),
        abstract: abstractMatch ? abstractMatch[1].trim() : undefined,
        queryable,
      });
    }

    // Root-Layer (Gruppen-Layer) entfernen – nur echte Daten-Layer behalten
    const dataLayers = layers.filter(
      (l) => !["WMS", service.wmsService].includes(l.name)
    );

    return { serviceId: service.id, wmsService: service.wmsService, layers: dataLayers };
  } catch (err) {
    return {
      serviceId: service.id,
      wmsService: service.wmsService,
      layers: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ---------------------------------------------------------------------------

function printResult(result: ServiceResult, configLayers: WmsLayer[]): void {
  const configNames = new Set(configLayers.map((l) => l.name));

  console.log(`\n${"─".repeat(60)}`);
  console.log(`Service: ${result.serviceId}`);
  console.log(`WMS:     ${result.wmsService}`);

  if (result.error) {
    console.log(`❌ Fehler: ${result.error}`);
    return;
  }

  if (result.layers.length === 0) {
    console.log("⚠️  Keine Layer gefunden");
    return;
  }

  console.log(`\nLayer (${result.layers.length} gefunden):`);

  for (const layer of result.layers) {
    const inConfig = configNames.has(layer.name);
    const icon = inConfig ? "✅" : "🔲";
    const queryIcon = layer.queryable ? "🖱️" : "  ";
    console.log(`  ${icon} ${queryIcon} ${layer.name}`);
    if (layer.title !== layer.name) {
      console.log(`        → ${layer.title}`);
    }
  }

  // Layer die in Config stehen aber nicht im WMS gefunden wurden
  const missingInWms = configLayers.filter(
    (l) => !result.layers.some((r) => r.name === l.name)
  );
  if (missingInWms.length > 0) {
    console.log(`\n⚠️  In Config definiert aber im WMS nicht gefunden:`);
    for (const l of missingInWms) {
      console.log(`  ❓ ${l.name} (→ "${l.label}")`);
    }
  }

  // Vorschlag für services.config.ts Einträge
  const newLayers = result.layers.filter((l) => !configNames.has(l.name));
  if (newLayers.length > 0) {
    console.log(`\n💡 Neue Layer (noch nicht in Config):`);
    for (const l of newLayers) {
      const entry: WmsLayer = { name: l.name, label: l.title };
      console.log(`  { name: "${entry.name}", label: "${entry.label}" },`);
    }
  }
}

// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const services = filterService
    ? SERVICES.filter((s) => s.id === filterService)
    : SERVICES;

  if (services.length === 0) {
    console.error(`Service "${filterService}" nicht gefunden.`);
    process.exit(1);
  }

  console.log(`FVA Capabilities Fetcher`);
  console.log(`Abfrage von ${services.length} Service(s)...\n`);

  // Parallel abfragen aber max 5 gleichzeitig um den Proxy nicht zu überlasten
  const results: ServiceResult[] = [];
  const chunkSize = 5;

  for (let i = 0; i < services.length; i += chunkSize) {
    const chunk = services.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(fetchCapabilities));
    results.push(...chunkResults);
    process.stdout.write(`  Fortschritt: ${Math.min(i + chunkSize, services.length)}/${services.length}\r`);
  }

  if (outputJson) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  // Textausgabe
  for (const result of results) {
    const service = SERVICES.find((s) => s.id === result.serviceId)!;
    printResult(result, service.layers);
  }

  // Zusammenfassung
  console.log(`\n${"═".repeat(60)}`);
  const ok = results.filter((r) => !r.error && r.layers.length > 0).length;
  const errors = results.filter((r) => r.error).length;
  const empty = results.filter((r) => !r.error && r.layers.length === 0).length;

  console.log(`Zusammenfassung: ${ok} ✅  ${errors} ❌  ${empty} ⚠️`);
  console.log(
    `\nTipp: npm run fetch-caps -- --json > docs/capabilities.json\n` +
    `      um die Ergebnisse zu speichern und in die Config zu übernehmen.`
  );
}

main().catch(console.error);
