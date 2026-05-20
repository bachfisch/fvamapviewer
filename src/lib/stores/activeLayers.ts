import { writable, derived } from 'svelte/store';
import { SERVICES } from '$config/services.config';

export type LayerId = string;

const initialVisible = new Set<LayerId>();

export const visibleLayers = writable<Set<LayerId>>(initialVisible);

export function toggleLayer(serviceId: string, layerName: string) {
  const key = `${serviceId}::${layerName}`;
  visibleLayers.update(set => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  });
}

export function isVisible(set: Set<LayerId>, serviceId: string, layerName: string): boolean {
  return set.has(`${serviceId}::${layerName}`);
}
