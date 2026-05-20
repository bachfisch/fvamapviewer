import { writable } from 'svelte/store';
import type { PanelEntry } from '$lib/popup/featureInfo';

interface PanelState {
  open: boolean;
  loading: boolean;
  lngLat: [number, number] | null;
  entries: PanelEntry[];
}

export const panelStore = writable<PanelState>({
  open: false,
  loading: false,
  lngLat: null,
  entries: [],
});

export function openPanel(lng: number, lat: number) {
  panelStore.update(s => ({ ...s, open: true, loading: true, lngLat: [lng, lat], entries: [] }));
}

export function setPanelResults(entries: PanelEntry[]) {
  panelStore.update(s => ({ ...s, loading: false, entries }));
}

export function closePanel() {
  panelStore.update(s => ({ ...s, open: false }));
}
