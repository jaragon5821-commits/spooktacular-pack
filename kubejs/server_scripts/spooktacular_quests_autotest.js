// priority: -30
// TEST BRANCH ONLY: automatic quest-rework test. Runs only in the world "Hallowstown Quest Test" (a copy of the
// Hallowstown Review world, every blueprint built), when the first player joins. Results go to the server log as
// [QuestAutoTest] PASS / FAIL lines. Remove before the release goes to main.

// Charter spots in the review world (anchor = middle of the front path, every building faces south, so the
// player faces north). The crypt Charter sits one block in front of the cemetery's.
const SPOOK_TEST_ANCHORS = {
  scarecrow: [-148, 64, -34], apothecary: [-108, 64, -33], boutique: [-63, 64, -32], smeltery: [-30, 64, -32],
  ward_arch: [149, 64, 0], stables: [-158, 64, -96], orchard_mill: [-115, 64, -108], garrison: [-67, 64, -96],
  tavern: [-13, 64, -92], pantry: [26, 64, -92], archive: [-96, 64, -153], spire: [-52, 64, -155],
  wharf: [-14, 64, -153], cemetery: [43, 64, -188], crypt: [43, 64, -187], cathedral: [-72, 64, -249],
  hall_of_heroes: [-18, 64, -250], citadel: [34, 64, -247], observatory: [80, 64, -248]
}
const SPOOK_TEST = {
  dm01: '31DEFF7A83AD87ED', ht05: '28C3841D89C1FD27', ht06: '2AE8B83641AEC2A5',
  safari1: '28CEEE6FFD02E9DB', ds01: '156C60BEE67E3DDF', ds05: '3CD216ACE1406F52'
}
let spookTestRan = false

function spookTestLog(ok, what) {
  console.info('[QuestAutoTest] ' + (ok ? 'PASS ' : 'FAIL ') + what)
}

PlayerEvents.loggedIn(event => {
  let server = event.server
  if (spookTestRan || String(server.worldData.levelName) != 'Hallowstown Quest Test') return
  spookTestRan = true
  let p = event.player, name = p.username, q = p.data.ftbquests
  let step = (ticks, label, fn) => server.scheduleInTicks(ticks, () => {
    try { fn() } catch (e) { console.error('[QuestAutoTest] ERROR in ' + label + ': ' + e) }
  })
  console.info('[QuestAutoTest] start, player ' + name)
  server.runCommandSilent('gamerule doDaylightCycle false')
  server.runCommandSilent('time set 18000')   // night, so the shows are easy to see

  // 1. Unlock: the Archive and the Scarecrow need their earlier quests done. No Charters placed yet.
  step(100, 'unlock', () => {
    let old = []
    spookCharters(server).getAllKeys().forEach(k => old.push(String(k)))
    old.forEach(k => spookCharters(server).remove(k))
    p.persistentData.remove('spookChartersGiven')
    q.complete(SPOOK_TEST.dm01); q.complete(SPOOK_TEST.ht05); q.complete(SPOOK_TEST.ds01)
    p.teleportTo('minecraft:overworld', -148.5, 64, -26.5, 180, 0)
  })
  // 2. The Scarecrow quest should hand out its Charter within a few seconds.
  step(400, 'charter given', () => {
    spookTestLog(p.inventory.find('spooktacular:charter_scarecrow') >= 0, 'Scarecrow quest gave its Town Charter')
    // load every building's chunks, then record a Charter at each anchor (as if placed facing north)
    Object.keys(SPOOK_TEST_ANCHORS).forEach(key => {
      let a = SPOOK_TEST_ANCHORS[key]
      server.runCommandSilent('forceload add ' + (a[0] - 48) + ' ' + (a[2] - 80) + ' ' + (a[0] + 48) + ' ' + (a[2] + 24))
    })
  })
  // 3. Every blueprint should match its building in the review world (needs >= 90%).
  step(700, 'blueprint match', () => {
    Object.keys(SPOOK_TEST_ANCHORS).forEach(key => {
      let a = SPOOK_TEST_ANCHORS[key]
      let tag = {}
      tag.x = a[0]; tag.y = a[1]; tag.z = a[2]; tag.dim = 'minecraft:overworld'; tag.facing = 'north'
      spookCharters(server).put(key, tag)
      delete spookScan[key]
      let pct = -1, guard = 0
      while (pct < 0 && guard++ < 100) pct = spookScanSlice(server, key)
      spookTestLog(pct >= SPOOK_MATCH, 'blueprint ' + key + ' matches ' + pct + '%')
      delete spookScan[key]
    })
    server.runCommandSilent('setblock -148 64 -34 spooktacular:charter_scarecrow')
  })
  // 4. Standing near the Scarecrow, its quest should complete on its own (and the show plays).
  step(1100, 'scarecrow quest', () => {
    spookTestLog(q.isCompleted(SPOOK_TEST.ht06), 'Scarecrow quest completed from its Charter (watch for fireworks + dome)')
  })
  // 5. Archive: a creeper photo advancement should complete its Rumor and Entity Found quests.
  step(1300, 'archive grant', () => {
    server.runCommandSilent('advancement grant ' + name + ' only spooktacular:archive/minecraft_creeper')
  })
  step(1400, 'archive check', () => {
    let pair = global.SPOOK_QUEST_DATA.archive['spooktacular:archive/minecraft_creeper']
    spookTestLog(q.isCompleted(pair[0]), 'Entity Found: Creepers completed from the photo advancement')
    spookTestLog(q.isCompleted(pair[1]), 'Rumor for Creepers completed from the photo advancement')
    // 6. Seven more creatures -> Safari Milestone I (8 of 28)
    Object.keys(global.SPOOK_QUEST_DATA.archive).slice(0, 8).forEach(adv =>
      server.runCommandSilent('advancement grant ' + name + ' only ' + adv))
  })
  step(1600, 'milestone', () => {
    let n = 0
    Object.keys(global.SPOOK_QUEST_DATA.archive).forEach(adv => { if (q.isCompleted(global.SPOOK_QUEST_DATA.archive[adv][0])) n++ })
    spookTestLog(n >= 8, n + ' Entity Found quests complete after 8-9 photos')
    spookTestLog(q.isCompleted(SPOOK_TEST.safari1), 'Safari Milestone I completed on its own')
  })
  // 7. Ribbon command and the Winner's Bag crate.
  step(1700, 'ribbon', () => {
    server.runCommandSilent('ribbon ' + name)
    spookTestLog(p.inventory.find('spooktacular:festival_ribbon') >= 0, '/ribbon gave a Festival Ribbon')
    let LootCrate = Java.loadClass('dev.ftb.mods.ftbquests.quest.loot.LootCrate')
    spookTestLog(LootCrate.LOOT_CRATES.get('winners_bag') != null, "Winner's Bag loot crate exists")
  })
  // 8. Dreamspace: entering one should complete (and reveal) its quest. Then come back.
  step(1800, 'dream go', () => {
    server.runCommandSilent('execute in dreamshift:dreamspace run tp ' + name + ' 0 120 0')
  })
  step(2000, 'dream check', () => {
    spookTestLog(String(p.level.dimension) == 'dreamshift:dreamspace', 'teleported into dreamshift:dreamspace')
    spookTestLog(q.isCompleted(SPOOK_TEST.ds05), 'Dreamspace quest completed on arrival')
    p.teleportTo('minecraft:overworld', -148.5, 64, -26.5, 180, 0)
  })
  step(2100, 'done', () => {
    server.runCommandSilent('forceload remove all')
    console.info('[QuestAutoTest] finished')
  })
})
