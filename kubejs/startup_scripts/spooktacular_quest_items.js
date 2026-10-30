// priority: 100
// Chop's Spooktacular quest rework: Town Charter blocks (one per town building) and the Festival Ribbons
// (one per event, so a ribbon only hands in at the event it was won at).
// The Charter marks a building's anchor (middle of the front path); spooktacular_quests_charters.js checks the build.

global.SPOOK_CHARTERS = {
  "scarecrow": "Colossal Scarecrow",
  "apothecary": "Witch's Apothecary",
  "boutique": "Masquerade Boutique",
  "smeltery": "Smeltery Annex",
  "ward_arch": "Spirit Ward Arch",
  "stables": "Carriage House and Stables",
  "orchard_mill": "Cider Mill",
  "garrison": "Garrison and Bounty Board",
  "archive": "Grand Archive",
  "spire": "Midnight Spire",
  "wharf": "Misty Wharf",
  "cathedral": "Grand Cathedral",
  "hall_of_heroes": "Hall of Heroes",
  "citadel": "Infernal Citadel",
  "observatory": "Void Observatory",
  "tavern": "Lantern & Lute Tavern",
  "pantry": "Hollow Pantry",
  "cemetery": "Hallowstown Cemetery",
  "crypt": "Catacombs and Occult Crypt"
}

global.SPOOK_RIBBONS = {
  "song": "Guess the Song",
  "costume": "Costume Contest",
  "matinee": "Midnight Matinee",
  "tombstones": "Musical Tombstones",
  "scavenger": "Pumpkin Scavenger Hunt",
  "anomaly": "Anomaly Hunt",
  "cornfield": "Cornfield Labyrinth",
  "cart_derby": "Pumpkin Cart Derby",
  "carving": "Pumpkin Carving Showdown",
  "skeet": "Belfry Skeet Shoot"
}

StartupEvents.registry('block', event => {
  Object.keys(global.SPOOK_CHARTERS).forEach(key => {
    event.create('spooktacular:charter_' + key)
      .displayName('Town Charter: ' + global.SPOOK_CHARTERS[key])
      .soundType('wood')
      .hardness(1.0)
      .resistance(3.0)
      .textureAll('spooktacular:block/town_charter')
  })
})

StartupEvents.registry('item', event => {
  Object.keys(global.SPOOK_RIBBONS).forEach(key => {
    event.create('spooktacular:ribbon_' + key)
      .displayName('Festival Ribbon: ' + global.SPOOK_RIBBONS[key])
      .texture('spooktacular:item/festival_ribbon')
      .maxStackSize(16)
      .rarity('epic')
      .glow(true)
  })
})
