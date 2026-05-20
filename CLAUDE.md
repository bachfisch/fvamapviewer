## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: none

---

# FVA Geo-Viewer – Projektkontext für Claude Code

## Was ist das?

Ein interaktiver Karten-Viewer für die Geodatendienste der Forstlichen Versuchs- und
Forschungsanstalt Baden-Württemberg (FVA, Freiburg). Alle Kartendienste laufen als WMS
über den OWS-Proxy des Landesamts für Geoinformation und Landentwicklung BW (LGL).

**Anbieter:** FVA Baden-Württemberg, Wonnhaldestraße 4, 79100 Freiburg
**Proxy-Basis-URL:** `https://owsproxy.lgl-bw.de/owsproxy/ows/`
**Metadaten:** https://metadaten.geoportal-bw.de

---

## Architektur-Entscheidungen (nicht diskutieren, direkt umsetzen)

| Bereich | Entscheidung | Begründung |
|---|---|---|
| Map Engine | **MapLibre GL JS** | WebGL, WMS-Support, kein Mapbox-Token |
| Basemap | **OpenFreeMap** (OpenStreetMap-Stil) | OpenSourceAccess, wird eventuell noch geändert |
| Charts | **Observable Plot** | Boxplot, Zeitreihe, Balken – einheitliches Theme |
| Framework | **SvelteKit** | Reaktiv, kleines Bundle, kein VDOM-Overhead |
| Sprache | **TypeScript** | Strenge Typen für Service-Config sind essenziell |
| Styling | **CSS Custom Properties** + Tailwind | Kein CSS-in-JS |

---

## Projektstruktur

```
fva-viewer/
├── CLAUDE.md                      ← diese Datei
├── docs/
│   └── architecture.md            ← ausführliche Architektur-Doku
├── src/
│   ├── config/
│   │   └── services.config.ts     ← HERZSTÜCK: alle WMS-Services definiert
│   ├── lib/
│   │   ├── map/
│   │   │   ├── MapView.svelte     ← MapLibre-Instanz, WMS-Layer-Stack
│   │   │   └── wmsLayer.ts        ← WMS Source/Layer Hilfsfunktionen
│   │   ├── sidebar/
│   │   │   ├── Sidebar.svelte     ← ein-/ausklappbares Menü
│   │   │   ├── CategoryGroup.svelte
│   │   │   └── LayerToggle.svelte
│   │   ├── popup/
│   │   │   ├── Popup.svelte       ← Container, lädt Chart-Komponente dynamisch
│   │   │   ├── AbstractPanel.svelte
│   │   │   └── LegendPanel.svelte
│   │   ├── charts/
│   │   │   ├── chartTheme.ts      ← globales Theme-Objekt für alle Charts
│   │   │   ├── TimeseriesChart.svelte
│   │   │   ├── BoxplotChart.svelte
│   │   │   ├── BarChart.svelte
│   │   │   └── FallbackTable.svelte
│   │   └── stores/
│   │       ├── activeLayers.ts    ← welche Layer sind sichtbar
│   │       └── mapState.ts        ← Kartenposition, Zoom
│   └── routes/
│       └── +page.svelte           ← Fullscreen-Layout
├── scripts/
│   └── fetch-capabilities.ts      ← lokal ausführen um Layer-Namen zu ermitteln
└── package.json
```

---

## Das Herzstück: services.config.ts

Wenn ein neuer WMS-Service hinzukommt, wird **nur diese Datei** editiert.
Alles andere (Menü, Karte, Popup) rendert sich automatisch daraus.

Jeder Service-Eintrag hat folgendes Schema – siehe `src/config/services.config.ts`.

**Wichtige Felder:**
- `popupComponent` → Name der Chart-Svelte-Komponente in `src/lib/charts/`
- `featureInfoType` → `'full'` | `'value-only'` | `'none'` (manche WMS liefern keine Attribute)
- `updateInterval` → `'static'` | `'daily'` | `'weekly'` (steuert Cache-Logik)
- `layers[]` → Array, weil viele Services mehrere Layer haben (z.B. Klimakarten nach Szenario)

---

## WMS GetFeatureInfo

Alle Klick-Abfragen laufen über GetFeatureInfo:
```
GET /owsproxy/ows/{SERVICE_NAME}
  ?SERVICE=WMS
  &VERSION=1.3.0
  &REQUEST=GetFeatureInfo
  &CRS=EPSG:4326
  &BBOX={bbox}
  &WIDTH={width}&HEIGHT={height}
  &LAYERS={layerName}
  &QUERY_LAYERS={layerName}
  &INFO_FORMAT=application/json
  &I={x}&J={y}
```

**CORS-Hinweis:** GetFeatureInfo-Requests müssen ggf. über einen eigenen kleinen Proxy
geleitet werden wenn der Browser CORS blockiert. Einfachste Lösung: SvelteKit
Server-Route als Proxy unter `/api/wms-proxy`.

---

## Chart-Theme

Alle Charts erhalten dasselbe Theme-Objekt aus `chartTheme.ts`:
```typescript
export const fvaTheme = {
  fontFamily: "...",
  colors: {
    primary:   "#1D9E75",  // FVA-Grün
    secondary: "#378ADD",
    warning:   "#EF9F27",
    danger:    "#D85A30",
    neutral:   "#888780",
  },
  axis: { labelFontSize: 11, tickFontSize: 10 },
  marginLeft: 48,
}
```

---

## Bekannte Knackpunkte

1. **Layer-Namen:** Müssen via GetCapabilities ermittelt werden. Script: `npm run fetch-caps`
2. **Multi-Layer-Klick:** Wenn mehrere Layer aktiv sind, nur den obersten sichtbaren abfragen.
   Fallback: alle aktiven Layer parallel abfragen, im Popup als Tabs.
3. **Legende:** WMS GetLegendGraphic liefert ein Bild (passt nicht zum Theme).
   Besser: eigene SVG-Legende pro Service in der Config definieren wo möglich.
4. **Täglich aktualisierte Layer** (Buchdrucker): Cache mit Timestamp, "Stand: TT.MM.JJJJ" anzeigen.
5. **Mobile:** Sidebar als Bottom-Drawer, Popup als Bottom-Sheet.
6. **Basemap-Token:** Maptiler API-Key in `.env` als `VITE_MAPTILER_KEY`.

---

## Lizenz der Daten

- **Open Data (dl-de/by-2.0):** Generalwildwegeplan, Klimaschutzwald, Auerhuhn-Dienste,
  alle Fernerkundungs-Layer. Namensnennung: "Datenquelle: FVA, www.fva-bw.de"
- **FVA-Nutzungsbedingungen:** Alle anderen Dienste. Kostenlose Nutzung, keine
  kommerzielle Nutzung ohne Vereinbarung. URL: https://www.fva-bw.de/daten-tools/geodaten/

---

## Nützliche Links

- FVA Geodatendienste: https://www.fva-bw.de/daten-tools/geodaten/geodatendienste
- Metadaten Geoportal BW: https://metadaten.geoportal-bw.de
- MapLibre GL JS Docs: https://maplibre.org/maplibre-gl-js/docs/
- Observable Plot Docs: https://observablehq.com/plot/
- Maptiler Styles: https://docs.maptiler.com/gl-style-specification/
