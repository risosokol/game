# OpenStreetMap data provenance

The playable map, road network, building footprints, and the ten curated
landmarks in this game are generated from real **OpenStreetMap** data via
three Overpass API exports covering central Trebišov, Slovakia:

- **roads.json** — every `highway=*` and `railway=*` way in the bounding box
- **buildings.json** — every `building=*` way/relation in the bounding box
- **poi.json** — every named node, plus `landuse=*`, `leisure=*`,
  `natural=water` and `waterway=*` ways/relations in the bounding box

The exact Overpass QL queries used are documented at the top of
[`scripts/generate-city-data.mjs`](../../scripts/generate-city-data.mjs),
which turns these exports into `src/world/cityLayout.ts` and
`src/data/landmarkAnchors.generated.ts`.

The raw multi-megabyte Overpass exports themselves are **not** committed to
this repository (most of their content falls outside the playable bounding
box and would just be dead weight) — regenerate them with the same queries
against <https://overpass-api.de/api/interpreter> (or another Overpass
instance) if you want to re-run or extend the generator.

## License

© OpenStreetMap contributors. This data is made available under the [Open
Database License (ODbL) v1.0](https://opendatacommons.org/licenses/odbl/).
Any redistribution of the raw data (as opposed to the derived, stylised
pixel-art game built from it) must credit OpenStreetMap and remain
share-alike per the ODbL. See <https://www.openstreetmap.org/copyright>.

## Extending the playable area

To cover more of Trebišov later:

1. Widen the bounding box in `src/geo/geoConstants.json`
   (`bboxLatMin/Max`, `bboxLonMin/Max`).
2. Re-export `roads.json` / `buildings.json` / `poi.json` for the new
   bounding box using the Overpass queries above.
3. Re-run `node scripts/generate-city-data.mjs roads.json buildings.json poi.json`.
4. If you want more curated, individually-discoverable landmarks (rather
   than the generic bucketed buildings everything else gets), add their
   OSM way id to `CURATED_BUILDING_IDS` in `generate-city-data.mjs` and a
   matching entry to `landmarkAnchors` there, then hand-write its
   description in `src/data/landmarks.ts`.
