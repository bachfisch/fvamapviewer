/**
 * FVA Geo-Viewer – Service Registry
 *
 * Das ist die einzige Datei die du editieren musst um einen neuen WMS-Service
 * hinzuzufügen. Alles andere (Menü, Karte, Popup, Legende) rendert sich daraus.
 *
 * Layer-Namen ermitteln:
 *   npm run fetch-caps
 *   → liest GetCapabilities aller Services und gibt Layer-Namen aus
 */

// ---------------------------------------------------------------------------
// Typen
// ---------------------------------------------------------------------------

export type Category =
  | "waldfunktionen"
  | "waldbiotope"
  | "standort"
  | "wildtier"
  | "klima"
  | "windenergie"
  | "fernerkundung";

export type UpdateInterval = "static" | "daily" | "weekly" | "monthly";

export type FeatureInfoType = "full" | "value-only" | "none";

export type PopupComponent =
  | "TimeseriesChart"
  | "BoxplotChart"
  | "BarChart"
  | "FallbackTable";

export interface WmsLayer {
  name: string;
  label: string;
  description?: string;
  defaultVisible?: boolean;
}

export interface ServiceConfig {
  id: string;
  label: string;
  category: Category;
  wmsService: string;
  layers: WmsLayer[];
  wmsVersion?: "1.1.1" | "1.3.0";
  abstract: string;
  contact?: string;
  updateInterval: UpdateInterval;
  featureInfoType: FeatureInfoType;
  popupComponent: PopupComponent;
  license: "open-data" | "fva-nutzungsbedingungen";
  legendUrl?: string;
  minZoom?: number;
  maxZoom?: number;
  scenarioRelative?: boolean; // scenario layers are fractional change relative to Heute layer
}

// ---------------------------------------------------------------------------
// Hilfskonstanten
// ---------------------------------------------------------------------------

const OWS_BASE = "https://owsproxy.lgl-bw.de/owsproxy/ows";
const METADATA_BASE = "https://metadaten.geoportal-bw.de/geonetwork/srv/api/records";

export function wmsUrl(service: string): string {
  return `${OWS_BASE}/${service}`;
}

export function metadataUrl(uuid: string): string {
  return `${METADATA_BASE}/${uuid}`;
}

// ---------------------------------------------------------------------------
// Kategorien-Metadaten
// ---------------------------------------------------------------------------

export interface CategoryMeta {
  id: Category;
  label: string;
  icon: string;
  description: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "waldfunktionen",
    label: "Waldfunktionen",
    icon: "trees",
    description: "Schutz- und Nutzungsfunktionen des Waldes nach LWaldG BW",
  },
  {
    id: "waldbiotope",
    label: "Waldbiotope",
    icon: "leaf",
    description: "Waldbiotopkartierung BW – gesetzlich geschützte Biotope im Wald",
  },
  {
    id: "standort",
    label: "Forstliche Standortkartierung",
    icon: "layers-difference",
    description: "Standortskundliche Gliederung und forstliche Standortskarten BW",
  },
  {
    id: "wildtier",
    label: "Wildtierökologie",
    icon: "paw",
    description: "Nachweise und Lebensräume von Wildtierarten in BW",
  },
  {
    id: "klima",
    label: "Klimafolgenforschung",
    icon: "temperature",
    description: "Klimawandel-Szenarien, Gefährdungen und Baumarteneignung",
  },
  {
    id: "windenergie",
    label: "Windenergie im Wald",
    icon: "wind",
    description: "Windenergiepotential und Auerhuhn-Schutz",
  },
  {
    id: "fernerkundung",
    label: "Fernerkundung",
    icon: "satellite",
    description: "Luftbild-basierte Waldstrukturkarten, jährlich aktualisiert",
  },
];

// ---------------------------------------------------------------------------
// Service-Registry
// ---------------------------------------------------------------------------

export const SERVICES: ServiceConfig[] = [

  // ─── WALDFUNKTIONEN ─────────────────────────────────────────────────────

  {
    id: "bodenschutzwald",
    label: "Gesetzlicher Bodenschutzwald & Lawinenschutz",
    category: "waldfunktionen",
    wmsService: "WMS_FVA_Bodenschutzwald",
    wmsVersion: "1.3.0",
    layers: [
      { name: "bodenschutzwald", label: "Bodenschutzwald & Lawinenschutz", defaultVisible: true },
    ],
    abstract:
      "Gesetzliche Bodenschutzwälder schützen gemäß § 30 LWaldG den Boden vor Erosion, " +
      "Austrocknung und Verarmung. Die Lawinenschutzfunktion weist Wälder aus, die Siedlungen " +
      "und Verkehrswege vor Schneebewegungen sichern. Kartierung durch die FVA BW.",
    contact: "FVA BW – Abt. Biometrie und Informatik, gis.fva-bw@forst.bwl.de",
    updateInterval: "static",
    featureInfoType: "value-only",
    popupComponent: "FallbackTable",
    license: "fva-nutzungsbedingungen",
    minZoom: 8,
  },

  {
    id: "erholungswald-stufen",
    label: "Erholungswald Stufen 1 und 2",
    category: "waldfunktionen",
    wmsService: "WMS_FVA_Erholungswald_Stufe1und2",
    wmsVersion: "1.3.0",
    layers: [
      { name: "erholungswald", label: "Erholungswald Stufen 1 und 2", defaultVisible: true },
    ],
    abstract:
      "Erholungswälder sind forstlich ausgewiesene Flächen mit besonderer Bedeutung für die " +
      "Naherholung. Stufe 1 umfasst Wälder mit sehr hohem Erholungsdruck (Verdichtungsräume), " +
      "Stufe 2 Wälder mit erhöhtem Erholungsbedarf.",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "static",
    featureInfoType: "value-only",
    popupComponent: "FallbackTable",
    license: "fva-nutzungsbedingungen",
  },

  {
    id: "erholungswald-gesetzlich",
    label: "Gesetzlicher Erholungswald",
    category: "waldfunktionen",
    wmsService: "WMS_FVA_Gesetzlicher_Erholungswald",
    wmsVersion: "1.3.0",
    layers: [
      { name: "gesetzlicher_erholungswald", label: "Gesetzlicher Erholungswald", defaultVisible: true },
    ],
    abstract:
      "Nach § 33 LWaldG durch Rechtsverordnung ausgewiesene Erholungswälder. Höchste Schutz- " +
      "und Pflegestufe. Bewirtschaftung ist dem Erholungsziel untergeordnet.",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "static",
    featureInfoType: "value-only",
    popupComponent: "FallbackTable",
    license: "fva-nutzungsbedingungen",
  },

  {
    id: "immissionsschutzwald",
    label: "Immissionsschutzwald",
    category: "waldfunktionen",
    wmsService: "WMS_FVA_Immissionsschutzwald",
    wmsVersion: "1.3.0",
    layers: [
      { name: "immissionsschutzwald", label: "Immissionsschutzwald", defaultVisible: true },
    ],
    abstract:
      "Wälder die Siedlungen, Erholungsgebiete oder landwirtschaftliche Nutzflächen vor " +
      "schädlichen Luftverunreinigungen schützen. Kartiert nach Lage zu Emissionsquellen " +
      "und Windverhältnissen.",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "static",
    featureInfoType: "value-only",
    popupComponent: "FallbackTable",
    license: "fva-nutzungsbedingungen",
    minZoom: 6,
  },

  {
    id: "klimaschutzwald",
    label: "Klimaschutzwald",
    category: "waldfunktionen",
    wmsService: "WMS_FVA_Klimaschutzwald",
    wmsVersion: "1.3.0",
    layers: [
      { name: "klimaschutzwald", label: "Klimaschutzwald", defaultVisible: true },
    ],
    abstract:
      "Wälder mit besonderer Bedeutung für den lokalen und regionalen Klimaschutz: " +
      "Kaltluftproduktion, Frischluftschneisen, Temperaturausgleich für Siedlungsbereiche. " +
      "Grundlage: Klimaanalysen der Regierungspräsidien BW.",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "static",
    featureInfoType: "value-only",
    popupComponent: "FallbackTable",
    license: "open-data",
    minZoom: 6,
  },

  {
    id: "sichtschutzwald",
    label: "Sichtschutzwald",
    category: "waldfunktionen",
    wmsService: "WMS_FVA_Sichtschutzwald",
    wmsVersion: "1.3.0",
    layers: [
      { name: "sichtschutzwald", label: "Sichtschutzwald", defaultVisible: true },
    ],
    abstract:
      "Wälder die störende Anlagen oder Landschaftseingriffe visuell abschirmen und damit " +
      "das Landschaftsbild schützen.",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "static",
    featureInfoType: "value-only",
    popupComponent: "FallbackTable",
    license: "fva-nutzungsbedingungen",
  },

  {
    id: "umweltschutzwald",
    label: "Gesetzlicher Schutzwald gegen schädliche Umwelteinwirkungen",
    category: "waldfunktionen",
    wmsService: "WMS_FVA_Gesetzlicher_Umweltschutzwald",
    wmsVersion: "1.3.0",
    layers: [
      { name: "umweltschutzwald", label: "Umweltschutzwald", defaultVisible: true },
    ],
    abstract:
      "Per Rechtsverordnung ausgewiesene Schutzwälder gemäß § 30 LWaldG, die Siedlungen " +
      "vor schädlichen Einwirkungen schützen.",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "static",
    featureInfoType: "value-only",
    popupComponent: "FallbackTable",
    license: "fva-nutzungsbedingungen",
  },

  {
    id: "wasserschutzwald",
    label: "Sonstiger Wasserschutzwald",
    category: "waldfunktionen",
    wmsService: "WMS_FVA_Wasserschutzwald",
    wmsVersion: "1.3.0",
    layers: [
      { name: "sonstiger_wasserschutzwald", label: "Wasserschutzwald", defaultVisible: true },
    ],
    abstract:
      "Wälder in Wasserschutz- und Wassereinzugsgebieten mit Funktion für Grundwasser- " +
      "neubildung, Quellschutz und Hochwasserregulierung. Nicht zu verwechseln mit dem " +
      "gesetzlichen Wasserschutzwald nach Wasserrecht.",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "static",
    featureInfoType: "value-only",
    popupComponent: "FallbackTable",
    license: "fva-nutzungsbedingungen",
    minZoom: 6,
  },

  // ─── WALDBIOTOPE ────────────────────────────────────────────────────────

  {
    id: "waldbiotope",
    label: "Waldbiotope (Waldbiotopkartierung BW)",
    category: "waldbiotope",
    wmsService: "WMS_FVA_Waldbiotope",
    wmsVersion: "1.3.0",
    layers: [
      { name: "waldbiotope", label: "Waldbiotope", defaultVisible: true },
    ],
    abstract:
      "Die Waldbiotopkartierung (WBK) wird von der FVA Freiburg unter Federführung der " +
      "Abt. Waldnaturschutz durchgeführt. Erfasst werden im Maßstab 1:10.000 alle nach " +
      "§ 30 BNatSchG, § 32 NatSchG BW und § 30a LWaldG gesetzlich geschützten Biotope im Wald " +
      "sowie Biotope die der Selbstbindung des Waldbesitzers unterliegen. " +
      "Seit 2007 werden in FFH-Gebieten zusätzlich Wald-Lebensraumtypen erfasst.",
    contact: "FVA BW – Abt. Waldnaturschutz",
    updateInterval: "weekly",
    featureInfoType: "full",
    popupComponent: "FallbackTable",
    license: "fva-nutzungsbedingungen",
    minZoom: 10,
  },

  // ─── FORSTLICHE STANDORTKARTIERUNG ──────────────────────────────────────

  {
    id: "standortskarte",
    label: "Forstliche Standortskarte",
    category: "standort",
    wmsService: "WMS_FVA_Forstliche_Standortskarte",
    wmsVersion: "1.3.0",
    layers: [
      { name: "kartierobjektuebersicht", label: "Forstliche Standortskarte", defaultVisible: true },
    ],
    abstract:
      "Die forstliche Standortskartierung erfasst die natürlichen Standortbedingungen " +
      "(Boden, Wasser, Klima) für die Waldbewirtschaftung. Maßstab 1:10.000, " +
      "sichtbar ab Zoom 1:18.000. Grundlage für Baumartenwahl und Waldbauplanung.",
    contact: "FVA BW – Abt. Standortkunde",
    updateInterval: "static",
    featureInfoType: "full",
    popupComponent: "FallbackTable",
    license: "fva-nutzungsbedingungen",
    minZoom: 12,
    maxZoom: 22,
  },

  {
    id: "regionale-gliederung",
    label: "Standortskundliche Regionale Gliederung",
    category: "standort",
    wmsService: "WMS_FVA_RegionaleGliederung",
    wmsVersion: "1.3.0",
    layers: [
      { name: "regionale_zonalwaelder_klimahaupttyp", label: "Regionale Gliederung", defaultVisible: true },
    ],
    abstract:
      "Großräumige standortskundliche Gliederung Baden-Württembergs in Wuchsgebiete, " +
      "Wuchsbezirke und Wuchsdistrikte. Sichtbar bis Maßstab 1:3.000.000. " +
      "Grundlage für überregionale Waldplanung.",
    contact: "FVA BW – Abt. Standortkunde",
    updateInterval: "static",
    featureInfoType: "full",
    popupComponent: "FallbackTable",
    license: "fva-nutzungsbedingungen",
    minZoom: 6,
  },

  // ─── WILDTIERÖKOLOGIE ───────────────────────────────────────────────────

  {
    id: "generalwildwegeplan",
    label: "Generalwildwegeplan",
    category: "wildtier",
    wmsService: "WMS_FVA_Generalwildwegeplan",
    wmsVersion: "1.3.0",
    layers: [
      { name: "Wildtierkorridor_1000m", label: "Wildtierkorridore", defaultVisible: true },
    ],
    abstract:
      "Der Generalwildwegeplan BW zeigt das landesweite Netz von Wildtierkorridoren und " +
      "Lebensraumverbundachsen. Er dient als Planungsgrundlage für Raumordnung, Straßenbau " +
      "und Waldwirtschaft um Wildtierbewegungen langfristig zu sichern.",
    contact: "FVA BW – FVA-Wildtierinstitut, gis.fva-bw@forst.bwl.de",
    updateInterval: "static",
    featureInfoType: "full",
    popupComponent: "FallbackTable",
    license: "open-data",
  },

  {
    id: "rotwildgebiete",
    label: "Rotwildgebiete",
    category: "wildtier",
    wmsService: "WMS_FVA_Rotwildgebiete",
    wmsVersion: "1.3.0",
    layers: [
      { name: "rotwildgebiete_baden_wuerttemberg", label: "Rotwildgebiete", defaultVisible: true },
    ],
    abstract:
      "Offizielle Rotwildgebiete in Baden-Württemberg gemäß Rotwildkonzept. " +
      "Zeigt Lebensräume und Bewirtschaftungsräume des Rothirsches.",
    contact: "FVA BW – FVA-Wildtierinstitut",
    updateInterval: "static",
    featureInfoType: "value-only",
    popupComponent: "FallbackTable",
    license: "fva-nutzungsbedingungen",
    minZoom: 6,
  },

  {
    id: "wildruhegebiete",
    label: "Wildruhegebiete",
    category: "wildtier",
    wmsService: "WMS_FVA_Wildruhegebiete",
    wmsVersion: "1.3.0",
    layers: [
      { name: "wildschutzgebiete_und_wildruhegebiete", label: "Wildruhegebiete", defaultVisible: true },
    ],
    abstract:
      "Ausgewiesene Ruhezonen für störungsempfindliche Wildtierarten, insbesondere " +
      "Auerhuhn und Luchs. Betreten oder Befahren ist saisonal oder ganzjährig eingeschränkt.",
    contact: "FVA BW – FVA-Wildtierinstitut",
    updateInterval: "static",
    featureInfoType: "full",
    popupComponent: "FallbackTable",
    license: "fva-nutzungsbedingungen",
  },

  {
    id: "wildkatzennachweise",
    label: "Wildkatzennachweise",
    category: "wildtier",
    wmsService: "WMS_FVA_Wildkatze",
    wmsVersion: "1.3.0",
    layers: [
      { name: "wildkatzennachweise", label: "Nachweise", defaultVisible: true },
    ],
    abstract:
      "Kartierte Nachweise der Europäischen Wildkatze (Felis silvestris) in BW. " +
      "Daten aus Monitoring-Programmen und Meldungen. Grundlage für Schutzmaßnahmen " +
      "und Habitatverbund-Planung.",
    contact: "FVA BW – FVA-Wildtierinstitut",
    updateInterval: "monthly",
    featureInfoType: "full",
    popupComponent: "FallbackTable",
    license: "fva-nutzungsbedingungen",
  },

  {
    id: "luchsnachweise",
    label: "Luchsnachweise",
    category: "wildtier",
    wmsService: "WMS_FVA_Luchsnachweise",
    wmsVersion: "1.3.0",
    layers: [
      { name: "luchsnachweise_2016_2017", label: "Nachweise (10×10 km Raster)", defaultVisible: true },
    ],
    abstract:
      "Nachweise des Eurasischen Luchses (Lynx lynx) in BW im 10×10 km-Rasterformat. " +
      "Auflösung absichtlich vergröbert um Störung von Individuen zu vermeiden. " +
      "Datenpflege durch das FVA-Wildtierinstitut.",
    contact: "FVA BW – FVA-Wildtierinstitut",
    updateInterval: "monthly",
    featureInfoType: "value-only",
    popupComponent: "FallbackTable",
    license: "fva-nutzungsbedingungen",
  },

  {
    id: "wolfsnachweise",
    label: "Wolfsnachweise",
    category: "wildtier",
    wmsService: "WMS_FVA_Wolfsnachweise",
    wmsVersion: "1.3.0",
    layers: [
      { name: "wolfsnachweise_2016_2017", label: "Wolfsnachweise", defaultVisible: true },
    ],
    abstract:
      "Dokumentierte Wolfsnachweise (Canis lupus) in BW. Unterschieden werden " +
      "C1-Nachweise (genetisch gesichert) und C2-Nachweise (Sichtung/Riss). " +
      "Datenpflege in Kooperation mit der LUBW.",
    contact: "FVA BW – FVA-Wildtierinstitut",
    updateInterval: "monthly",
    featureInfoType: "full",
    popupComponent: "FallbackTable",
    license: "fva-nutzungsbedingungen",
  },

  {
    id: "auerhuhn-flaechen",
    label: "Auerhuhnrelevante Flächen",
    category: "wildtier",
    wmsService: "WMS_FVA_AuerhuhnFlaechen",
    wmsVersion: "1.3.0",
    layers: [
      { name: "prioritaere_flaechen", label: "Prioritäre Flächen", defaultVisible: true },
    ],
    abstract:
      "Auerhuhnrelevante Waldflächen in BW. Das Auerhuhn (Tetrao urogallus) ist in BW " +
      "stark gefährdet. Grundlage für den Aktionsplan Auerhuhn des MLR BW.",
    contact: "FVA BW – FVA-Wildtierinstitut",
    updateInterval: "monthly",
    featureInfoType: "full",
    popupComponent: "FallbackTable",
    license: "fva-nutzungsbedingungen",
  },

  {
    id: "auerhuhn-verbreitung",
    label: "Auerhuhnverbreitung",
    category: "wildtier",
    wmsService: "WMS_FVA_Auerhuhnverbreitung",
    wmsVersion: "1.3.0",
    layers: [
      { name: "auerhuhnverbreitungsgebiet_2023", label: "Verbreitungsgebiet 2023", defaultVisible: true },
    ],
    abstract:
      "Aktuelle Verbreitung des Auerhuhns (Tetrao urogallus) in BW (Stand 2023). " +
      "Grundlage für den Aktionsplan Auerhuhn des MLR BW.",
    contact: "FVA BW – FVA-Wildtierinstitut",
    updateInterval: "monthly",
    featureInfoType: "full",
    popupComponent: "FallbackTable",
    license: "fva-nutzungsbedingungen",
  },

  {
    id: "auerhuhn-aktionsplan",
    label: "Aktionsplan Auerhuhn – Maßnahmenplan",
    category: "wildtier",
    wmsService: "WMS_FVA_Auerhuhn_Aktion_Massnahmenplan",
    wmsVersion: "1.3.0",
    layers: [
      { name: "Massnahmenplan_2023-202841109", label: "Maßnahmenplan", defaultVisible: true },
    ],
    abstract:
      "Konkrete Maßnahmenflächen aus dem Aktionsplan Auerhuhn BW. Zeigt Prioritätsbereiche " +
      "für Habitatverbesserung, Störungsreduzierung und Wiederansiedlungsprojekte.",
    contact: "FVA BW – FVA-Wildtierinstitut",
    updateInterval: "monthly",
    featureInfoType: "full",
    popupComponent: "FallbackTable",
    license: "open-data",
  },

  {
    id: "windenergie-auerhuhn",
    label: "Windenergie und Auerhuhn",
    category: "wildtier",
    wmsService: "WMS_FVA_Auerhuhn_Windenergie",
    wmsVersion: "1.3.0",
    layers: [
      { name: "Windkraft_und_Auerhuhn14260", label: "Konfliktbereiche", defaultVisible: true },
    ],
    abstract:
      "Räumliche Überschneidung von Windenergie-Eignungsflächen mit Auerhuhn-Habitaten. " +
      "Grundlage: FVA-Planungshinweis 'Windenergie und Auerhuhn'. Zeigt Bereiche wo " +
      "besondere Prüfpflicht besteht.",
    contact: "FVA BW – FVA-Wildtierinstitut",
    updateInterval: "static",
    featureInfoType: "full",
    popupComponent: "FallbackTable",
    license: "open-data",
  },

  // ─── KLIMAFOLGENFORSCHUNG ────────────────────────────────────────────────

  {
    id: "klima-buchdrucker",
    label: "Buchdruckergefährdung",
    category: "klima",
    wmsService: "WMS_FVA_Klima_Buchdruckergefaehrdung",
    wmsVersion: "1.3.0",
    layers: [
      { name: "buchdruckerrisiko_1981_2010",   label: "Referenz 1981–2010" },
      { name: "buchdruckerrisiko_rcp45_2021_2050", label: "RCP 4.5 (2021–2050)" },
      { name: "buchdruckerrisiko_rcp45_2071_2100", label: "RCP 4.5 (2071–2100)" },
      { name: "buchdruckerrisiko_rcp85_2021_2050", label: "RCP 8.5 (2021–2050)" },
      { name: "buchdruckerrisiko_rcp85_2071_2100", label: "RCP 8.5 (2071–2100)" },
    ],
    abstract:
      "Räumliche Gefährdungskarte für Fichtenbestände durch den Buchdrucker (Ips typographus) " +
      "unter verschiedenen Klimaszenarien. Basiert auf Klimamodellen des FVA-Klimafolgen-Projekts.",
    contact: "FVA BW – Abt. Waldschutz & Abt. Biometrie und Informatik",
    updateInterval: "daily",
    featureInfoType: "value-only",
    popupComponent: "TimeseriesChart",
    license: "fva-nutzungsbedingungen",
  },

  {
    id: "klima-bonitaet",
    label: "Bonität",
    category: "klima",
    wmsService: "WMS_FVA_Klima_Bonitaet",
    wmsVersion: "1.3.0",
    layers: [
      { name: "ausgangsbonitaet_buche_current",               label: "Buche – Heute" },
      { name: "relative_bonitaetsveraenderung_buche_rcp45_2021_2050", label: "Buche – RCP 4.5 (2021–2050)" },
      { name: "relative_bonitaetsveraenderung_buche_rcp45_2071_2100", label: "Buche – RCP 4.5 (2071–2100)" },
      { name: "relative_bonitaetsveraenderung_buche_rcp85_2021_2050", label: "Buche – RCP 8.5 (2021–2050)" },
      { name: "relative_bonitaetsveraenderung_buche_rcp85_2071_2100", label: "Buche – RCP 8.5 (2071–2100)" },
      { name: "ausgangsbonitaet_eiche_current",               label: "Eiche – Heute" },
      { name: "relative_bonitaetsveraenderung_eiche_rcp45_2021_2050", label: "Eiche – RCP 4.5 (2021–2050)" },
      { name: "relative_bonitaetsveraenderung_eiche_rcp45_2071_2100", label: "Eiche – RCP 4.5 (2071–2100)" },
      { name: "relative_bonitaetsveraenderung_eiche_rcp85_2021_2050", label: "Eiche – RCP 8.5 (2021–2050)" },
      { name: "relative_bonitaetsveraenderung_eiche_rcp85_2071_2100", label: "Eiche – RCP 8.5 (2071–2100)" },
      { name: "ausgangsbonitaet_fichte_current",              label: "Fichte – Heute" },
      { name: "relative_bonitaetsveraenderung_fichte_rcp45_2021_2050", label: "Fichte – RCP 4.5 (2021–2050)" },
      { name: "relative_bonitaetsveraenderung_fichte_rcp45_2071_2100", label: "Fichte – RCP 4.5 (2071–2100)" },
      { name: "relative_bonitaetsveraenderung_fichte_rcp85_2021_2050", label: "Fichte – RCP 8.5 (2021–2050)" },
      { name: "relative_bonitaetsveraenderung_fichte_rcp85_2071_2100", label: "Fichte – RCP 8.5 (2071–2100)" },
      { name: "ausgangsbonitaet_tanne_current",               label: "Tanne – Heute" },
      { name: "relative_bonitaetsveraenderung_tanne_rcp45_2021_2050", label: "Tanne – RCP 4.5 (2021–2050)" },
      { name: "relative_bonitaetsveraenderung_tanne_rcp45_2071_2100", label: "Tanne – RCP 4.5 (2071–2100)" },
      { name: "relative_bonitaetsveraenderung_tanne_rcp85_2021_2050", label: "Tanne – RCP 8.5 (2021–2050)" },
      { name: "relative_bonitaetsveraenderung_tanne_rcp85_2071_2100", label: "Tanne – RCP 8.5 (2071–2100)" },
    ],
    abstract:
      "Veränderung der forstlichen Bonität (Wuchsleistung) wichtiger Baumarten unter " +
      "Klimawandel-Szenarien. Zeigt welche Flächen Bonitätsverluste oder -gewinne zu " +
      "erwarten haben. Grundlage: FVA-Klimakarten 2.1.",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "static",
    featureInfoType: "value-only",
    popupComponent: "BoxplotChart",
    license: "fva-nutzungsbedingungen",
    scenarioRelative: true,
  },

  {
    id: "klima-sturm",
    label: "Sturmwurfgefährdung",
    category: "klima",
    wmsService: "WMS_FVA_Klima_Sturm",
    wmsVersion: "1.3.0",
    layers: [
      { name: "sturmschadensrisiko_real_buche_eiche",      label: "Risiko – Buche/Eiche" },
      { name: "sturmschadensrisiko_real_fichte",           label: "Risiko – Fichte" },
      { name: "sturmschadensrisiko_real_tanne_douglasie",  label: "Risiko – Tanne/Douglasie" },
      { name: "sturmschadensrisiko_real_kiefer_laerche",   label: "Risiko – Kiefer/Lärche" },
      { name: "sturmschadensrisiko_real_andere_baumarten", label: "Risiko – Andere Baumarten" },
      { name: "sturmschadenspotential_buche_eiche",        label: "Potential – Buche/Eiche" },
      { name: "sturmschadenspotential_fichte",             label: "Potential – Fichte" },
      { name: "sturmschadenspotential_tanne_douglasie",    label: "Potential – Tanne/Douglasie" },
    ],
    abstract:
      "Räumliche Bewertung der Sturmwurfgefährdung von Waldbeständen unter Berücksichtigung " +
      "von Bestandsstruktur, Standort und projizierten Windverhältnissen.",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "static",
    featureInfoType: "value-only",
    popupComponent: "BarChart",
    license: "fva-nutzungsbedingungen",
  },

  {
    id: "klima-wasserhaushalt",
    label: "Bodenwasserhaushalt",
    category: "klima",
    wmsService: "WMS_FVA_Klima_Wasserhaushalt",
    wmsVersion: "1.3.0",
    layers: [
      { name: "relative_bodenwassersaettigung_buche_1981_2010",   label: "Buche – Referenz 1981–2010" },
      { name: "relative_bodenwassersaettigung_buche_rcp45_2021_2050", label: "Buche – RCP 4.5 (2021–2050)" },
      { name: "relative_bodenwassersaettigung_buche_rcp45_2071_2100", label: "Buche – RCP 4.5 (2071–2100)" },
      { name: "relative_bodenwassersaettigung_buche_rcp85_2021_2050", label: "Buche – RCP 8.5 (2021–2050)" },
      { name: "relative_bodenwassersaettigung_buche_rcp85_2071_2100", label: "Buche – RCP 8.5 (2071–2100)" },
      { name: "relative_bodenwassersaettigung_fichte_1981_2010",  label: "Fichte – Referenz 1981–2010" },
      { name: "relative_bodenwassersaettigung_fichte_rcp45_2021_2050", label: "Fichte – RCP 4.5 (2021–2050)" },
      { name: "relative_bodenwassersaettigung_fichte_rcp45_2071_2100", label: "Fichte – RCP 4.5 (2071–2100)" },
      { name: "relative_bodenwassersaettigung_fichte_rcp85_2021_2050", label: "Fichte – RCP 8.5 (2021–2050)" },
      { name: "relative_bodenwassersaettigung_fichte_rcp85_2071_2100", label: "Fichte – RCP 8.5 (2071–2100)" },
    ],
    abstract:
      "Modellierte Veränderungen im forstlichen Bodenwasserhaushalt unter Klimawandel. " +
      "Zeigt Trockenstress-Häufigkeit und Wasserverfügbarkeit für Waldbäume.",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "static",
    featureInfoType: "value-only",
    popupComponent: "TimeseriesChart",
    license: "fva-nutzungsbedingungen",
  },

  {
    id: "klima-artverbreitung",
    label: "Artverbreitung",
    category: "klima",
    wmsService: "WMS_FVA_Klima_Artverbreitung",
    wmsVersion: "1.3.0",
    layers: [
      { name: "artverbreitung_buche_heute",          label: "Buche – Heute" },
      { name: "artverbreitung_buche_rcp45_2041_2060", label: "Buche – RCP 4.5 (2041–2060)" },
      { name: "artverbreitung_buche_rcp45_2061_2080", label: "Buche – RCP 4.5 (2061–2080)" },
      { name: "artverbreitung_buche_rcp85_2041_2060", label: "Buche – RCP 8.5 (2041–2060)" },
      { name: "artverbreitung_buche_rcp85_2061_2080", label: "Buche – RCP 8.5 (2061–2080)" },
      { name: "artverbreitung_eiche_heute",          label: "Eiche – Heute" },
      { name: "artverbreitung_eiche_rcp45_2041_2060", label: "Eiche – RCP 4.5 (2041–2060)" },
      { name: "artverbreitung_eiche_rcp45_2061_2080", label: "Eiche – RCP 4.5 (2061–2080)" },
      { name: "artverbreitung_eiche_rcp85_2041_2060", label: "Eiche – RCP 8.5 (2041–2060)" },
      { name: "artverbreitung_eiche_rcp85_2061_2080", label: "Eiche – RCP 8.5 (2061–2080)" },
      { name: "artverbreitung_fichte_heute",         label: "Fichte – Heute" },
      { name: "artverbreitung_fichte_rcp45_2041_2060", label: "Fichte – RCP 4.5 (2041–2060)" },
      { name: "artverbreitung_fichte_rcp45_2061_2080", label: "Fichte – RCP 4.5 (2061–2080)" },
      { name: "artverbreitung_fichte_rcp85_2041_2060", label: "Fichte – RCP 8.5 (2041–2060)" },
      { name: "artverbreitung_fichte_rcp85_2061_2080", label: "Fichte – RCP 8.5 (2061–2080)" },
      { name: "artverbreitung_tanne_heute",          label: "Tanne – Heute" },
      { name: "artverbreitung_tanne_rcp45_2041_2060", label: "Tanne – RCP 4.5 (2041–2060)" },
      { name: "artverbreitung_tanne_rcp45_2061_2080", label: "Tanne – RCP 4.5 (2061–2080)" },
      { name: "artverbreitung_tanne_rcp85_2041_2060", label: "Tanne – RCP 8.5 (2041–2060)" },
      { name: "artverbreitung_tanne_rcp85_2061_2080", label: "Tanne – RCP 8.5 (2061–2080)" },
    ],
    abstract:
      "Prognostizierte Verschiebung der Verbreitung wichtiger Baumarten in BW unter " +
      "verschiedenen Klimaszenarien. Basiert auf Species Distribution Models (SDM).",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "static",
    featureInfoType: "value-only",
    popupComponent: "BoxplotChart",
    license: "fva-nutzungsbedingungen",
  },

  {
    id: "klima-vulnerabilitaet",
    label: "Vulnerabilität",
    category: "klima",
    wmsService: "WMS_FVA_Klima_Vulnerabilitaet",
    wmsVersion: "1.3.0",
    layers: [
      { name: "vulnerabilitaet_gesamt", label: "Gesamt" },
      { name: "vulnerabilitaet_buche",  label: "Buche" },
      { name: "vulnerabilitaet_eiche",  label: "Eiche" },
      { name: "vulnerabilitaet_fichte", label: "Fichte" },
      { name: "vulnerabilitaet_tanne",  label: "Tanne" },
    ],
    abstract:
      "Synthetische Vulnerabilitätskarte für den Wald BW unter Klimawandel: kombiniert " +
      "Exposition, Sensitivität und Anpassungskapazität.",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "static",
    featureInfoType: "value-only",
    popupComponent: "BoxplotChart",
    license: "fva-nutzungsbedingungen",
  },

  {
    id: "klima-baumarteneignung",
    label: "Baumarteneignung",
    category: "klima",
    wmsService: "WMS_FVA_Klima_Baumarteneignung_Klimawandel",
    wmsVersion: "1.3.0",
    layers: [
      { name: "baumarteneignung_bergahorn_heute",          label: "Bergahorn – Heute" },
      { name: "baumarteneignung_bergahorn_rcp45_2041_2060", label: "Bergahorn – RCP 4.5 (2041–2060)" },
      { name: "baumarteneignung_bergahorn_rcp45_2061-2080", label: "Bergahorn – RCP 4.5 (2061–2080)" },
      { name: "baumarteneignung_bergahorn_rcp85_2041_2060", label: "Bergahorn – RCP 8.5 (2041–2060)" },
      { name: "baumarteneignung_bergahorn_rcp85_2061-2080", label: "Bergahorn – RCP 8.5 (2061–2080)" },
      { name: "baumarteneignung_buche_heute",              label: "Buche – Heute" },
      { name: "baumarteneignung_buche_rcp45_2021_2050",    label: "Buche – RCP 4.5 (2021–2050)" },
      { name: "baumarteneignung_buche_rcp45_2071_2100",    label: "Buche – RCP 4.5 (2071–2100)" },
      { name: "baumarteneignung_buche_rcp85_2021_2050",    label: "Buche – RCP 8.5 (2021–2050)" },
      { name: "baumarteneignung_buche_rcp85_2071_2100",    label: "Buche – RCP 8.5 (2071–2100)" },
      { name: "baumarteneignung_douglasie_heute",          label: "Douglasie – Heute" },
      { name: "baumarteneignung_douglasie_rcp45_2041_2060", label: "Douglasie – RCP 4.5 (2041–2060)" },
      { name: "baumarteneignung_douglasie_rcp45_2061-2080", label: "Douglasie – RCP 4.5 (2061–2080)" },
      { name: "baumarteneignung_douglasie_rcp85_2041_2060", label: "Douglasie – RCP 8.5 (2041–2060)" },
      { name: "baumarteneignung_douglasie_rcp85_2061-2080", label: "Douglasie – RCP 8.5 (2061–2080)" },
      { name: "baumarteneignung_eiche_heute",              label: "Eiche – Heute" },
      { name: "baumarteneignung_eiche_rcp45_2041_2060",    label: "Eiche – RCP 4.5 (2041–2060)" },
      { name: "baumarteneignung_eiche_rcp45_2061-2080",    label: "Eiche – RCP 4.5 (2061–2080)" },
      { name: "baumarteneignung_eiche_rcp85_2041_2060",    label: "Eiche – RCP 8.5 (2041–2060)" },
      { name: "baumarteneignung_eiche_rcp85_2061-2080",    label: "Eiche – RCP 8.5 (2061–2080)" },
      { name: "baumarteneignung_fichte_heute",             label: "Fichte – Heute" },
      { name: "baumarteneignung_fichte_rcp45_2021_2050",   label: "Fichte – RCP 4.5 (2021–2050)" },
      { name: "baumarteneignung_fichte_rcp45_2071_2100",   label: "Fichte – RCP 4.5 (2071–2100)" },
      { name: "baumarteneignung_fichte_rcp85_2021_2050",   label: "Fichte – RCP 8.5 (2021–2050)" },
      { name: "baumarteneignung_fichte_rcp85_2071_2100",   label: "Fichte – RCP 8.5 (2071–2100)" },
      { name: "baumarteneignung_tanne_heute",              label: "Tanne – Heute" },
      { name: "baumarteneignung_tanne_rcp45_2021_2050",    label: "Tanne – RCP 4.5 (2021–2050)" },
      { name: "baumarteneignung_tanne_rcp45_2071_2100",    label: "Tanne – RCP 4.5 (2071–2100)" },
      { name: "baumarteneignung_tanne_rcp85_2021_2050",    label: "Tanne – RCP 8.5 (2021–2050)" },
      { name: "baumarteneignung_tanne_rcp85_2071_2100",    label: "Tanne – RCP 8.5 (2071–2100)" },
      { name: "baumarteneignung_waldkiefer_heute",         label: "Waldkiefer – Heute" },
      { name: "baumarteneignung_waldkiefer_rcp45_2041_2060", label: "Waldkiefer – RCP 4.5 (2041–2060)" },
      { name: "baumarteneignung_waldkiefer_rcp45_2061-2080", label: "Waldkiefer – RCP 4.5 (2061–2080)" },
      { name: "baumarteneignung_waldkiefer_rcp85_2041_2060", label: "Waldkiefer – RCP 8.5 (2041–2060)" },
      { name: "baumarteneignung_waldkiefer_rcp85_2061-2080", label: "Waldkiefer – RCP 8.5 (2061–2080)" },
    ],
    abstract:
      "Klimatische Eignung verschiedener Baumarten für die Wiederbewaldung nach Störungen " +
      "unter verschiedenen Klimaszenarien. Grundlage: FVA-Klimakarten 2.1.",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "static",
    featureInfoType: "value-only",
    popupComponent: "BoxplotChart",
    license: "fva-nutzungsbedingungen",
  },

  // ─── WINDENERGIE IM WALD ────────────────────────────────────────────────

  {
    id: "windpotential-525",
    label: "Windenergiepotential Wald – 5,25 m/s in 100 m",
    category: "windenergie",
    wmsService: "WMS_FVA_Windenergiepotential_Wald_525ms_100m",
    wmsVersion: "1.3.0",
    layers: [
      { name: "windenergiepotential_wald_525ms_100m", label: "Potential ≥ 5,25 m/s", defaultVisible: true },
    ],
    abstract:
      "Potenzialstudie Windenergie im Wald BW: Flächen mit einer mittleren Windgeschwindigkeit " +
      "von ≥ 5,25 m/s in 100 m Höhe über Grund. Untergrenze für wirtschaftlichen Betrieb " +
      "kleiner Anlagen. Erstellt von der FVA im Auftrag des MLR BW.",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "static",
    featureInfoType: "value-only",
    popupComponent: "FallbackTable",
    license: "fva-nutzungsbedingungen",
  },

  {
    id: "windpotential-575",
    label: "Windenergiepotential Wald – 5,75 m/s in 100 m",
    category: "windenergie",
    wmsService: "WMS_FVA_Windenergiepotential_Wald_575ms_100m",
    wmsVersion: "1.3.0",
    layers: [
      { name: "windenergiepotential_wald_575ms_100m", label: "Potential ≥ 5,75 m/s", defaultVisible: true },
    ],
    abstract:
      "Potenzialstudie Windenergie im Wald BW: Flächen mit einer mittleren Windgeschwindigkeit " +
      "von ≥ 5,75 m/s in 100 m Höhe über Grund. Mindestanforderung für moderne Großanlagen.",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "static",
    featureInfoType: "value-only",
    popupComponent: "FallbackTable",
    license: "fva-nutzungsbedingungen",
  },

  // ─── FERNERKUNDUNG ───────────────────────────────────────────────────────
  // Hinweis: WMS_FVA_Fernerkundung_Luecken_Bestandhoehen unterstützt nur EPSG:25832
  // und ist daher in MapLibre GL JS (EPSG:3857/4326) nicht darstellbar.

  {
    id: "laub-nadelwaldkarte",
    label: "Laub-Nadelwaldkarte",
    category: "fernerkundung",
    wmsService: "WMS_FVA_Fernerkundung_Laub_Nadelwald",
    wmsVersion: "1.1.1",
    layers: [
      { name: "fern_laubnadelwald", label: "Waldtyp (Laub / Misch / Nadel)", defaultVisible: true },
    ],
    abstract:
      "Klassifikation des Waldes in Nadel-, Misch- und Laubwald auf Basis von Luftbild-Befliegungen. " +
      "Grundlage für die Auswahl neuer Waldschutzgebiete und forstliche Planung. " +
      "Jährliche Aktualisierung aus Befliegungen der letzten 3 Jahre.",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "monthly",
    featureInfoType: "value-only",
    popupComponent: "BarChart",
    license: "open-data",
  },

  {
    id: "waldhoehen",
    label: "Waldhöhenstrukturkarte",
    category: "fernerkundung",
    wmsService: "WMS_FVA_Fernerkundung_Waldhoehenstruktur",
    wmsVersion: "1.1.1",
    layers: [
      { name: "fern_whsk", label: "Bestandeshöhe", defaultVisible: true },
    ],
    abstract:
      "Karte der Waldhöhenstruktur aus normalisierten Höhenmodellen (nDSMs), " +
      "berechnet aus Luftbild-Befliegungen. Zeigt Bestandeshöhen und vertikale " +
      "Waldstruktur auf Einzelbaum-naher Ebene.",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "monthly",
    featureInfoType: "value-only",
    popupComponent: "BarChart",
    license: "open-data",
  },

  {
    id: "baumbedeckung",
    label: "Baumbedeckung",
    category: "fernerkundung",
    wmsService: "WMS_FVA_Fernerkundung_Baumbedeckung",
    wmsVersion: "1.1.1",
    layers: [
      { name: "fern_baumlayer", label: "Baumbedeckung", defaultVisible: true },
    ],
    abstract:
      "Identifikation von Einzelbäumen innerhalb und außerhalb des Waldes aus " +
      "Luftbildbefliegungen. Grundlage für Biodiversitätsmonitoring und " +
      "Stadtbaum-Kartierungen.",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "monthly",
    featureInfoType: "value-only",
    popupComponent: "FallbackTable",
    license: "open-data",
  },

  {
    id: "waldbedeckung",
    label: "Waldbedeckung",
    category: "fernerkundung",
    wmsService: "WMS_FVA_Fernerkundung_Waldbedeckung",
    wmsVersion: "1.1.1",
    layers: [
      { name: "fern_waldbedeckung", label: "Waldbedeckung", defaultVisible: true },
    ],
    abstract:
      "Binäre Klassifikation Wald / Nicht-Wald aus Luftbildauswertung. " +
      "Aktueller und genauer als das amtliche Liegenschaftskataster für " +
      "dynamische Waldgrenzveränderungen nach Störungen.",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "monthly",
    featureInfoType: "value-only",
    popupComponent: "FallbackTable",
    license: "open-data",
  },

  {
    id: "waldbestockung",
    label: "Waldbestockung",
    category: "fernerkundung",
    wmsService: "WMS_FVA_Fernerkundung_Waldbestockung",
    wmsVersion: "1.1.1",
    layers: [
      { name: "fern_bestockungslayer", label: "Waldbestockung", defaultVisible: true },
    ],
    abstract:
      "Differenziertere Klassifikation des Waldes nach Bestockungsgrad und Struktur " +
      "ergänzend zur reinen Waldbedeckung. Unterscheidet z.B. Bestandswald, " +
      "Verjüngungsflächen und Windwurfflächen.",
    contact: "FVA BW – Abt. Biometrie und Informatik",
    updateInterval: "monthly",
    featureInfoType: "value-only",
    popupComponent: "FallbackTable",
    license: "open-data",
  },

];

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

export function getServicesByCategory(category: Category): ServiceConfig[] {
  return SERVICES.filter((s) => s.category === category);
}

export function getServiceById(id: string): ServiceConfig | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function getWmsUrl(service: ServiceConfig): string {
  return wmsUrl(service.wmsService);
}

export function getDailyServices(): ServiceConfig[] {
  return SERVICES.filter((s) => s.updateInterval === "daily");
}
