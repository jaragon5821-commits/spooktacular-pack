// priority: 100
// Chop's Spooktacular quest rework: Town Charter blocks (one per town building) and the Festival Ribbon.
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
  event.create('spooktacular:festival_ribbon')
    .displayName('Festival Ribbon')
    .texture('spooktacular:item/festival_ribbon')
    .maxStackSize(16)
    .rarity('epic')
    .glow(true)
})
