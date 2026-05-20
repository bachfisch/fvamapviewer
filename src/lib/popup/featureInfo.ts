import type { ServiceConfig, WmsLayer } from '$config/services.config';
import { SERVICES } from '$config/services.config';
import { get } from 'svelte/store';
import { visibleLayers, isVisible } from '$lib/stores/activeLayers';

const OWS_BASE = 'https://owsproxy.lgl-bw.de/owsproxy/ows';

// ── Types ──────────────────────────────────────────────────────────────────

export interface MapViewport {
  bbox: string;   // "minLng,minLat,maxLng,maxLat" in EPSG:4326
  width: number;  // container CSS pixels
  height: number;
  x: number;      // click pixel
  y: number;
}

export interface LayerResult {
  layer: WmsLayer;
  value: number | null;
  properties: Record<string, unknown> | null;
  pixelColor?: string | null;
}

export interface ServiceEntry {
  kind: 'standard' | 'klima';
  service: ServiceConfig;
  results: LayerResult[];
}

export interface FernEntry {
  kind: 'fernerkundung';
  rows: Array<{ service: ServiceConfig; layer: WmsLayer; value: number | null }>;
}

export type PanelEntry = ServiceEntry | FernEntry;

// ── Klima layer name parsing ───────────────────────────────────────────────

const SPECIES_LABELS: Record<string, string> = {
  buche_eiche:      'Buche / Eiche',
  tanne_douglasie:  'Tanne / Douglasie',
  kiefer_laerche:   'Kiefer / Lärche',
  andere_baumarten: 'Andere',
  bergahorn:        'Bergahorn',
  douglasie:        'Douglasie',
  waldkiefer:       'Waldkiefer',
  gesamt:           'Gesamt',
  buche:            'Buche',
  eiche:            'Eiche',
  fichte:           'Fichte',
  tanne:            'Tanne',
};

// Sorted longest-first so 'buche_eiche' matches before 'buche'
const SPECIES_SORTED = Object.keys(SPECIES_LABELS).sort((a, b) => b.length - a.length);

export interface ScenarioInfo {
  label: string;      // full label, not used for axis anymore
  timePeriod: string; // short: "Heute", "2021–50", "2071–100" etc.
  scenarioGroup: string; // "Heute", "Referenz", "RCP 4.5", "RCP 8.5"
  groupOrder: number; // 0=Heute/Ref, 1=RCP4.5, 2=RCP8.5
  order: number;      // within group
  color: string;
}

// Colors convey climate severity: grey = ref, blue = RCP4.5, orange-red = RCP8.5
export const SCENARIO_MAP: Record<string, ScenarioInfo> = {
  'current':         { label: 'Heute',            timePeriod: 'Heute',    scenarioGroup: 'Heute',    groupOrder: 0, order: 0, color: '#888780' },
  'heute':           { label: 'Heute',            timePeriod: 'Heute',    scenarioGroup: 'Heute',    groupOrder: 0, order: 0, color: '#888780' },
  '1981_2010':       { label: 'Ref. 1981–2010',   timePeriod: '1981–2010', scenarioGroup: 'Referenz', groupOrder: 0, order: 0, color: '#888780' },
  'rcp45_2021_2050': { label: 'RCP 4.5 2021–50',  timePeriod: '2021–50',  scenarioGroup: 'RCP 4.5',  groupOrder: 1, order: 1, color: '#9DC5E8' },
  'rcp45_2041_2060': { label: 'RCP 4.5 2041–60',  timePeriod: '2041–60',  scenarioGroup: 'RCP 4.5',  groupOrder: 1, order: 2, color: '#6AAAD4' },
  'rcp45_2061_2080': { label: 'RCP 4.5 2061–80',  timePeriod: '2061–80',  scenarioGroup: 'RCP 4.5',  groupOrder: 1, order: 3, color: '#378ADD' },
  'rcp45_2061-2080': { label: 'RCP 4.5 2061–80',  timePeriod: '2061–80',  scenarioGroup: 'RCP 4.5',  groupOrder: 1, order: 3, color: '#378ADD' },
  'rcp45_2071_2100': { label: 'RCP 4.5 2071–100', timePeriod: '2071–100', scenarioGroup: 'RCP 4.5',  groupOrder: 1, order: 4, color: '#1D5FA0' },
  'rcp85_2021_2050': { label: 'RCP 8.5 2021–50',  timePeriod: '2021–50',  scenarioGroup: 'RCP 8.5',  groupOrder: 2, order: 1, color: '#F5C98A' },
  'rcp85_2041_2060': { label: 'RCP 8.5 2041–60',  timePeriod: '2041–60',  scenarioGroup: 'RCP 8.5',  groupOrder: 2, order: 2, color: '#EF9F27' },
  'rcp85_2061_2080': { label: 'RCP 8.5 2061–80',  timePeriod: '2061–80',  scenarioGroup: 'RCP 8.5',  groupOrder: 2, order: 3, color: '#E07020' },
  'rcp85_2061-2080': { label: 'RCP 8.5 2061–80',  timePeriod: '2061–80',  scenarioGroup: 'RCP 8.5',  groupOrder: 2, order: 3, color: '#E07020' },
  'rcp85_2071_2100': { label: 'RCP 8.5 2071–100', timePeriod: '2071–100', scenarioGroup: 'RCP 8.5',  groupOrder: 2, order: 4, color: '#D85A30' },
};

export interface KlimaPoint {
  speciesKey: string | null;
  speciesLabel: string | null;
  scenarioGroup: string;  // "Heute", "Referenz", "RCP 4.5", "RCP 8.5"
  timePeriod: string;     // "Heute", "2021–50", "2071–100" etc.
  groupOrder: number;
  barLabel: string;       // unique composite key for chart x-axis
  order: number;
  color: string;
  value: number | null;
  layer: WmsLayer;
}

export function parseKlimaResult(result: LayerResult): KlimaPoint {
  const name = result.layer.name;

  const speciesKey = SPECIES_SORTED.find(s =>
    name.includes(`_${s}_`) || name.endsWith(`_${s}`)
  ) ?? null;

  const scenarioKey = Object.keys(SCENARIO_MAP).find(sk =>
    name.endsWith(`_${sk}`)
  ) ?? null;

  const scenario = scenarioKey ? SCENARIO_MAP[scenarioKey] : null;

  return {
    speciesKey,
    speciesLabel: speciesKey ? (SPECIES_LABELS[speciesKey] ?? speciesKey) : null,
    scenarioGroup: scenario?.scenarioGroup ?? 'Andere',
    timePeriod: scenario?.timePeriod ?? result.layer.label,
    groupOrder: scenario?.groupOrder ?? 99,
    barLabel: scenario?.label ?? result.layer.label,
    order: scenario?.order ?? 99,
    color: result.pixelColor ?? scenario?.color ?? '#1D9E75',
    value: result.value,
    layer: result.layer,
  };
}

// ── GetFeatureInfo fetch ───────────────────────────────────────────────────

async function fetchOne(
  service: ServiceConfig,
  layer: WmsLayer,
  vp: MapViewport
): Promise<LayerResult> {
  // Server requires FORMAT and uses ESRI WMS XML response regardless of INFO_FORMAT
  const url =
    `${OWS_BASE}/${service.wmsService}` +
    `?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo` +
    `&FORMAT=image/png` +
    `&SRS=EPSG:4326&BBOX=${vp.bbox}` +
    `&WIDTH=${vp.width}&HEIGHT=${vp.height}&X=${vp.x}&Y=${vp.y}` +
    `&LAYERS=${encodeURIComponent(layer.name)}` +
    `&QUERY_LAYERS=${encodeURIComponent(layer.name)}` +
    `&INFO_FORMAT=application/json&FEATURE_COUNT=1`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { layer, value: null, properties: null };
    const text = await res.text();
    return parseXmlResponse(layer, text);
  } catch {
    return { layer, value: null, properties: null };
  }
}

async function fetchPixelColor(
  service: ServiceConfig,
  layer: WmsLayer,
  lng: number,
  lat: number
): Promise<string | null> {
  const d = 0.0001;
  const url =
    `${OWS_BASE}/${service.wmsService}` +
    `?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap` +
    `&FORMAT=image/png&TRANSPARENT=true` +
    `&SRS=EPSG:4326&BBOX=${lng - d},${lat - d},${lng + d},${lat + d}` +
    `&WIDTH=3&HEIGHT=3` +
    `&LAYERS=${encodeURIComponent(layer.name)}&STYLES=`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = 3;
    canvas.height = 3;
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0);
    const [r, g, b, a] = canvas.getContext('2d')!.getImageData(1, 1, 1, 1).data;
    if (a < 128) return null;
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } catch {
    return null;
  }
}

// Parse ESRI WMS FeatureInfoResponse XML:
// <FeatureInfoResponse><FIELDS PixelValue="1.23" /></FeatureInfoResponse>
// or for vector layers: <FIELDS attr1="val1" attr2="val2" ... />
function parseXmlResponse(layer: WmsLayer, xml: string): LayerResult {
  try {
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    const fields = doc.querySelector('FIELDS');
    if (!fields) return { layer, value: null, properties: null };

    const attrs: Record<string, unknown> = {};
    for (const attr of Array.from(fields.attributes)) {
      const num = parseFloat(attr.value);
      attrs[attr.name] = isNaN(num) ? attr.value : num;
    }

    // Raster: PixelValue attribute
    const pv = fields.getAttribute('PixelValue');
    if (pv !== null) {
      if (pv === 'NoData' || pv === '') return { layer, value: null, properties: null };
      return { layer, value: parseFloat(pv), properties: null };
    }

    // Vector: all attributes as properties, first numeric as value
    const firstNum = Object.values(attrs).find(v => typeof v === 'number' && isFinite(v as number));
    return {
      layer,
      value: typeof firstNum === 'number' ? firstNum : null,
      properties: Object.keys(attrs).length ? attrs : null,
    };
  } catch {
    return { layer, value: null, properties: null };
  }
}

// ── Main entry point ───────────────────────────────────────────────────────

export async function queryAtPoint(lng: number, lat: number, vp: MapViewport): Promise<PanelEntry[]> {
  const current = get(visibleLayers);

  const activeServices = SERVICES.filter(
    s => s.featureInfoType !== 'none' && s.layers.some(l => isVisible(current, s.id, l.name))
  );
  if (!activeServices.length) return [];

  const hasFern = activeServices.some(s => s.category === 'fernerkundung');

  type Task = { kind: 'fern' | 'klima' | 'standard'; service: ServiceConfig; layer: WmsLayer };
  const tasks: Task[] = [];

  // Fernerkundung: query ALL fern services regardless of which are active
  if (hasFern) {
    for (const svc of SERVICES.filter(s => s.category === 'fernerkundung')) {
      for (const layer of svc.layers) tasks.push({ kind: 'fern', service: svc, layer });
    }
  }

  // Klima: query ALL layers of each active klima service
  for (const svc of activeServices.filter(s => s.category === 'klima')) {
    for (const layer of svc.layers) tasks.push({ kind: 'klima', service: svc, layer });
  }

  // Standard: only the active/visible layers
  for (const svc of activeServices.filter(s => s.category !== 'fernerkundung' && s.category !== 'klima')) {
    for (const layer of svc.layers.filter(l => isVisible(current, svc.id, l.name))) {
      tasks.push({ kind: 'standard', service: svc, layer });
    }
  }

  // Phase 1: all GetFeatureInfo requests in parallel
  const phase1 = await Promise.all(
    tasks.map(async t => ({ ...t, result: await fetchOne(t.service, t.layer, vp) }))
  );

  // Phase 2: pixel color only for klima layers that actually have a value
  const settled = await Promise.all(
    phase1.map(async t => {
      if (t.kind !== 'klima' || t.result.value === null) {
        return { ...t, result: { ...t.result, pixelColor: null } };
      }
      const pixelColor = await fetchPixelColor(t.service, t.layer, lng, lat);
      return { ...t, result: { ...t.result, pixelColor } };
    })
  );

  const entries: PanelEntry[] = [];

  // Fernerkundung → one combined entry
  const fernRows = settled
    .filter(r => r.kind === 'fern')
    .map(r => ({ service: r.service, layer: r.layer, value: r.result.value }));
  if (fernRows.length) entries.push({ kind: 'fernerkundung', rows: fernRows });

  // Klima → one entry per service
  const klimaMap = new Map<string, ServiceEntry>();
  for (const r of settled.filter(r => r.kind === 'klima')) {
    if (!klimaMap.has(r.service.id))
      klimaMap.set(r.service.id, { kind: 'klima', service: r.service, results: [] });
    klimaMap.get(r.service.id)!.results.push(r.result);
  }
  entries.push(...klimaMap.values());

  // Standard → one entry per service
  const stdMap = new Map<string, ServiceEntry>();
  for (const r of settled.filter(r => r.kind === 'standard')) {
    if (!stdMap.has(r.service.id))
      stdMap.set(r.service.id, { kind: 'standard', service: r.service, results: [] });
    stdMap.get(r.service.id)!.results.push(r.result);
  }
  entries.push(...stdMap.values());

  return entries;
}
