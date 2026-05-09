# FVA Geodatendienste – Interaktiver Kartenviewer

Interaktiver 3D-Kartenviewer für die WMS-Geodatendienste der [Forstlichen Versuchs- und Forschungsanstalt Baden-Württemberg (FVA)](https://www.fva-bw.de).

## Features

- **3D-Geländedarstellung** mit einstellbarer Überhöhung (MapLibre GL JS + Maptiler DEM)
- **2D/3D-Umschaltung** per Knopfdruck
- **WMS-Layer** aus 7 Themenbereichen, einzeln ein- und ausschaltbar
- **Legende** automatisch je aktivem Layer (WMS GetLegendGraphic)
- **Klimafolgenforschung-Filter**: Baumart und Zeitraum/Klimaszenario wählbar
- Basiskarte: OpenStreetMap HOT

## Themenbereiche

| Bereich | Inhalt |
|---|---|
| Fernerkundung | Baumbedeckung, Laub-Nadelwald, Waldbedeckung, Waldbestockung, Waldhöhenstruktur |
| Waldfunktionen | Bodenschutz-, Erholungs-, Immissions-, Klima-, Sicht-, Umweltschutz-, Wasserschutzwald |
| Waldbiotope | Waldbiotope BW |
| Forstliche Standortskartierung | Standortskarte, Regionale Gliederung |
| Wildtierökologie | Auerhuhn, Wildkatze, Luchs, Wolf, Rotwild, Wildruhegebiete, Generalwildwegeplan |
| Klimafolgenforschung | Bonität, Buchdruckergefährdung, Sturmwurf, Bodenwasserhaushalt, Artverbreitung, Vulnerabilität, Baumarteneignung |
| Windenergiepotenzial | 5,25 m/s und 5,75 m/s – 100 m Nabenhöhe |

## Dateien

```
index.html               # Hauptanwendung (Single-file, kein Build-Schritt)
fva-geodatendienste.html # Synchrone Kopie für den FVA-Webauftritt
www/                     # Statische Assets (Logo, Icons)
extern/                  # Referenzdateien (FVA-Dashboard-Template)
```

## Deployment

Statische HTML-Datei – kein Build-Schritt, kein Server erforderlich. Einfach `index.html` auf einen Webserver legen. Die `www/`-Assets müssen im selben Verzeichnis liegen.

## Datenquellen

Alle Kartendaten werden live per WMS von `owsproxy.lgl-bw.de` abgerufen:

```
https://owsproxy.lgl-bw.de/owsproxy/ows/{WMS_NAME}
```

Die Dienste werden von der FVA BW bereitgestellt und unterliegen der [Datenlizenz Deutschland – Namensnennung – Version 2.0](https://www.govdata.de/dl-de/by-2-0).

## Bekannte Einschränkungen

- `WMS_FVA_Fernerkundung_Luecken_Bestandhoehen` (Lücken & Bestandeshöhentypen) liefert GetMap-Anfragen für EPSG:3857 und EPSG:4326 mit HTTP 500 – nur EPSG:25832 funktioniert, das MapLibre für gekachelte Raster nicht unterstützt. Layer daher deaktiviert.
- Klimafolgenforschung-Layer für Artverbreitung und Vulnerabilität unterstützen nicht alle Baumarten.
