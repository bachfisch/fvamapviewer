import type { Map, RasterSourceSpecification, RasterLayerSpecification } from 'maplibre-gl';
import type { ServiceConfig, WmsLayer } from '$config/services.config';

const OWS_BASE = 'https://owsproxy.lgl-bw.de/owsproxy/ows';

export function wmsSourceId(serviceId: string, layerName: string): string {
  return `wms-src-${serviceId}-${layerName}`;
}

export function wmsLayerId(serviceId: string, layerName: string): string {
  return `wms-lyr-${serviceId}-${layerName}`;
}

export function addWmsLayer(
  map: Map,
  service: ServiceConfig,
  layer: WmsLayer,
  visible: boolean
): void {
  const srcId = wmsSourceId(service.id, layer.name);
  const lyrId = wmsLayerId(service.id, layer.name);
  const version = service.wmsVersion ?? '1.3.0';

  // {bbox-epsg-3857} must appear literally in the URL – URLSearchParams would encode the braces
  const crsParam = version === '1.3.0' ? 'CRS' : 'SRS';
  const tileUrl =
    `${OWS_BASE}/${service.wmsService}` +
    `?SERVICE=WMS&VERSION=${version}&REQUEST=GetMap` +
    `&FORMAT=image/png&TRANSPARENT=true` +
    `&LAYERS=${encodeURIComponent(layer.name)}&STYLES=` +
    `&${crsParam}=EPSG:3857&WIDTH=256&HEIGHT=256` +
    `&BBOX={bbox-epsg-3857}`;

  const tiles = [tileUrl];

  if (!map.getSource(srcId)) {
    map.addSource(srcId, {
      type: 'raster',
      tiles,
      tileSize: 256,
      attribution: 'Datenquelle: FVA, www.fva-bw.de',
    } as RasterSourceSpecification);
  }

  if (!map.getLayer(lyrId)) {
    const spec: RasterLayerSpecification = {
      id: lyrId,
      type: 'raster',
      source: srcId,
      layout: { visibility: visible ? 'visible' : 'none' },
      paint: { 'raster-opacity': 0.85 },
    };
    if (service.minZoom !== undefined) spec.minzoom = service.minZoom;
    if (service.maxZoom !== undefined) spec.maxzoom = service.maxZoom;
    map.addLayer(spec);
  }
}

export function setLayerVisibility(
  map: Map,
  serviceId: string,
  layerName: string,
  visible: boolean
): void {
  const lyrId = wmsLayerId(serviceId, layerName);
  if (map.getLayer(lyrId)) {
    map.setLayoutProperty(lyrId, 'visibility', visible ? 'visible' : 'none');
  }
}
