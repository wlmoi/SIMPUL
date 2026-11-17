/**
 * Schematic layout of the MRT Fatmawati station frontage, in metres.
 * x runs west -> east, z runs north -> south, y is height.
 * Derived from public photos of the station (illustrative only, NOT surveyed GIS).
 */
export const LAYOUT = Object.freeze({
  xMin: -170,
  xMax: 170,
  // Arterial road beside the station (the analysed street). Eastbound; lane 0 = curb lane.
  southRoad: Object.freeze({z0: 0, z1: 10.5, lanes: Object.freeze([8.75, 5.25, 1.75])}),
  // Arterial on the far side of the toll. Westbound; lane 0 = curb lane.
  northRoad: Object.freeze({z0: -30, z1: -19.5, lanes: Object.freeze([-28.25, -24.75, -21.25])}),
  // Toll JORR in the middle: context only, never analysed.
  toll: Object.freeze({z0: -17, z1: -2.5, lanes: Object.freeze([
    Object.freeze({z: -4.3, dir: 1}), Object.freeze({z: -7.9, dir: 1}),
    Object.freeze({z: -11.6, dir: -1}), Object.freeze({z: -15.2, dir: -1})
  ])}),
  sidewalkS: Object.freeze({z0: 10.5, z1: 14.5}),
  sidewalkN: Object.freeze({z0: -33.5, z1: -30}),
  // Elevated station straddling the arterial road (~175 m x 22 m; platform ~25.6 m, roof ~34 m above the road).
  station: Object.freeze({x0: -88, x1: 87, z0: -1.5, z1: 21.5, mezz: 8.5, concourse: 15, platform: 25.6, top: 34.3,
    pillarRows: Object.freeze([-1.2, 15.1, 21.1])}),
  // Service lane under the station used as the dedicated pick-up area in A1.
  bay: Object.freeze({x0: -66, x1: 66, z0: 15.7, z1: 20.7, moveZ: 16.9, slotZ: 19.4, entryX: -60, exitX: 60,
    slots: Object.freeze([-44, -37, -30, -23, -16, -9, -2, 5, 12, 19, 26, 33, 40, 47])}),
  entrances: Object.freeze([Object.freeze({x: -44, z: 13}), Object.freeze({x: 44, z: 13})]),
  zones: Object.freeze([
    Object.freeze({id: 'Zona A', x0: -128, x1: -98, note: 'barat stasiun, titik henti informal'}),
    Object.freeze({id: 'Zona B', x0: -14, x1: 14, note: 'di bawah stasiun, depan pintu masuk'}),
    Object.freeze({id: 'Zona C', x0: 22, x1: 50, note: 'di bawah stasiun, sisi timur'})
  ]),
  bayZoneId: 'Area A1',
  halte: Object.freeze({x0: 76, x1: 96, stopX: 86})
});
