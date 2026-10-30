// priority: -30
// TEST BRANCH ONLY: automatic quest-rework test. Runs only when kubejs/config/spook_autotest.json says
// {"run": true} (the file is not part of the pack; the tester creates it), in the world "Hallowstown Quest Test"
// (a copy of the Hallowstown Review world, every blueprint built), when the first player joins. It switches
// itself off again when done. Results go to the server log as [QuestAutoTest] PASS / FAIL lines.
// Optional: "slipCommands": [...] are run as the player at the end (for slippage screenshots), and
// "slipOnly": true skips the quest checks. Remove before the release goes to main.

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
const SPOOK_TEST_CONFIG = 'kubejs/config/spook_autotest.json'

function spookTestLog(ok, what) {
  console.info('[QuestAutoTest] ' + (ok ? 'PASS ' : 'FAIL ') + what)
}

// Starts once the joining player has really been ticking for 10 seconds (the client finishes loading first;
// before that the server can stall and then race through scheduled steps).
PlayerEvents.tick(event => {
  let server = event.server
  if (spookTestRan || event.player.age < 200) return
  let lvl = String(server.worldData.levelName)
  if (lvl.indexOf('Hallowstown Quest Test') != 0 && lvl.indexOf('Hallowstown Review') != 0) { spookTestRan = true; return }
  let cfg = JsonIO.read(SPOOK_TEST_CONFIG)
  spookTestRan = true
  if (!cfg || cfg.run !== true) return
  JsonIO.write(SPOOK_TEST_CONFIG, { run: false, note: 'switched off after a run; set run to true to test again' })
  let p = event.player, name = p.username, q = p.data.ftbquests
  if (cfg.slipOnly === true) {
    // a stone wall 2 blocks north of the player, who looks straight at it: "dreamshift slippage create"
    // opens a slippage on the block face the player is looking at
    server.runCommandSilent('fill -151 64 -25 -146 67 -25 minecraft:stone_bricks')
    server.runCommandSilent('time set 18000')
    p.teleportTo('minecraft:overworld', -148.5, 64, -22.5, 180, 0)
    spookTestSlips(server, name, cfg.slipCommands || ['dreamshift slippage create'])
    if (cfg.charterClick === true) {
      // right-click the Spire's Charter through the same code the real click uses (a script can't click)
      let a = SPOOK_TEST_ANCHORS.spire
      server.runCommandSilent('setblock ' + a[0] + ' ' + a[1] + ' ' + a[2] + ' spooktacular:charter_spire')
      spookCharters(server).put('spire', { x: a[0], y: a[1], z: a[2], dim: 'minecraft:overworld', facing: 'north' })
      delete spookScan.spire
      server.scheduleInTicks(60, () => {
        try {
          spookCharterClick({ server: server, player: p, block: { x: a[0], y: a[1], z: a[2] } }, 'spire')
          console.info('[QuestAutoTest] charter click ran, see chat line above')
        } catch (e) { console.error('[QuestAutoTest] ERROR in charter click: ' + e) }
      })
    }
    return
  }
  let step = (ticks, label, fn) => server.scheduleInTicks(ticks, () => {
    try { fn() } catch (e) { console.error('[QuestAutoTest] ERROR in ' + label + ': ' + e) }
  })
  console.info('[QuestAutoTest] start, player ' + name + ', spookDim: ' + spookDim(p.level))
  server.runCommandSilent('gamerule doDaylightCycle false')
  server.runCommandSilent('time set 18000')   // night, so the shows are easy to see
  server.runCommandSilent('difficulty normal')  // the review world is on Peaceful, which deletes test monsters at once

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
    // stand back and look at the sky over the Scarecrow; replay the show a few times for screenshots
    server.runCommandSilent('setblock -149 74 -6 minecraft:glass')
    server.runCommandSilent('tp ' + name + ' -148.5 75 -5.5 180 -25')
    spookTimes(3, i => server.scheduleInTicks(40 + i * 400, () => {
      console.info('[QuestAutoTest] fanfare replay ' + (i + 1) + ' now')
      if (i == 0) global.spookFanfareDebug = 12
      if (i == 0) server.scheduleInTicks(100, () => {
        let r1 = server.runCommand('execute in minecraft:overworld run particle minecraft:end_rod -148.5 85 -34.5 1 1 1 0 300 force')
        let r2 = server.runCommand('execute as ' + name + ' at @s run particle minecraft:end_rod ^ ^1 ^6 1 1 1 0 300 force')
        let r3 = server.runCommand('execute in minecraft:overworld run particle minecraft:dust 1 0.55 0 4 -148.5 80 -30.5 2 2 2 0 300 force')
        console.info('[QuestAutoTest] particle test (+7 s): server-pos end_rod=' + r1 + ', in-front-of-player end_rod=' + r2 + ', dust=' + r3)
      })
      spookFanfare(server, 'scarecrow', global.SPOOK_CHARTERS.scarecrow)
    }))
  })
  // 5. Archive: a creeper in front of the camera. Calls Exposure's own photo trigger with the creeper "in frame",
  //    the same call the camera makes when a picture is taken. Also checks the frame detection itself.
  step(2560, 'photo setup', () => {
    p.teleportTo('minecraft:overworld', -148.5, 64, -26.5, 180, 0)
    server.runCommandSilent('execute as ' + name + ' at @s run summon minecraft:creeper ^ ^ ^5 {NoAI:1b,Silent:1b,PersistenceRequired:1b,Tags:["spooktest"]}')
  })
  step(2600, 'photo', () => {
    let Triggers = Java.loadClass('io.github.mortuusars.exposure.Exposure$ExposureCriteriaTriggers')
    let Frame = Java.loadClass('io.github.mortuusars.exposure.world.camera.frame.Frame')
    let ArrayList = Java.loadClass('java.util.ArrayList')
    let creeper = p.level.getEntitiesWithin(AABB.of(p.x - 10, p.y - 3, p.z - 10, p.x + 10, p.y + 5, p.z + 10)).filter(e => e.tags.contains('spooktest'))[0]
    spookTestLog(!!creeper, 'test creeper is standing in front of the player')
    try {
      let EIF = Java.loadClass('io.github.mortuusars.exposure.world.camera.frame.EntitiesInFrame')
      let POV = Java.loadClass('io.github.mortuusars.exposure.util.PointOfView')
      // EntitiesInFrame.get has an Entity and a CameraHolder version; the player is both, so name one
      let seen = EIF['get(net.minecraft.world.entity.Entity,io.github.mortuusars.exposure.util.PointOfView,double)'](p, new POV(p.getEyePosition(), p.getLookAngle()), 70.0)
      let names = []
      seen.forEach(e => names.push(String(e.type)))
      spookTestLog(names.indexOf('minecraft:creeper') >= 0, 'camera frame check sees the creeper (' + names.join(' ') + ')')
    } catch (e) { console.info('[QuestAutoTest] frame check not run: ' + e) }
    let stack = Item.of('exposure:camera')
    // a real photo always records focal length, light level and time of day; the advancement checks needs them
    let frame = Frame.create().updateExtraData(tag => {
      tag.putInt('focal_length', 50); tag.putInt('light_level', 15); tag.putInt('day_time', 18000)
    }).toImmutable()
    try {
      Triggers.FRAME_EXPOSED.trigger(p, p, stack, frame, new ArrayList(), new ArrayList())
      spookTestLog(true, 'a photo with nothing in it does not crash the camera')
    } catch (e) { spookTestLog(false, 'a photo with nothing in it crashed: ' + e) }
    try {
      let list = new ArrayList()
      list.add(creeper)
      Triggers.FRAME_EXPOSED.trigger(p, p, stack, frame, new ArrayList(), list)
      spookTestLog(true, 'a photo of the creeper does not crash the camera')
    } catch (e) { spookTestLog(false, 'a photo of the creeper crashed: ' + e) }
    server.runCommandSilent('kill @e[tag=spooktest]')
  })
  step(2700, 'archive check', () => {
    let pair = global.SPOOK_QUEST_DATA.archive['spooktacular:archive/minecraft_creeper']
    spookTestLog(q.isCompleted(pair[0]), 'Entity Found: Creepers completed from the photo')
    spookTestLog(q.isCompleted(pair[1]), 'Rumor for Creepers completed from the photo')
    // 6. Seven more creatures -> Safari Milestone I (8 of 28)
    Object.keys(global.SPOOK_QUEST_DATA.archive).slice(0, 8).forEach(adv =>
      server.runCommandSilent('advancement grant ' + name + ' only ' + adv))
  })
  step(2900, 'milestone', () => {
    let n = 0
    Object.keys(global.SPOOK_QUEST_DATA.archive).forEach(adv => { if (q.isCompleted(global.SPOOK_QUEST_DATA.archive[adv][0])) n++ })
    spookTestLog(n >= 8, n + ' Entity Found quests complete after 8-9 photos')
    spookTestLog(q.isCompleted(SPOOK_TEST.safari1), 'Safari Milestone I completed on its own')
  })
  // 7. Ribbon command and the Winner's Bag crate.
  step(3000, 'ribbon', () => {
    server.runCommandSilent('ribbon ' + name + ' song')
    spookTestLog(p.inventory.find('spooktacular:ribbon_song') >= 0, '/ribbon <player> song gave the Guess the Song ribbon')
    spookTestLog(p.inventory.find('spooktacular:ribbon_carving') < 0, 'no other event ribbon was given')
    let LootCrate = Java.loadClass('dev.ftb.mods.ftbquests.quest.loot.LootCrate')
    spookTestLog(LootCrate.LOOT_CRATES.get('winners_bag') != null, "Winner's Bag loot crate exists")
  })
  // 8. Dreamspace: entering one should complete (and reveal) its quest. Then come back.
  step(3100, 'dream go', () => {
    server.runCommandSilent('execute in dreamshift:dreamspace run tp ' + name + ' 0 120 0')
  })
  step(3140, 'dream check', () => {
    console.info('[QuestAutoTest] dimension raw: ' + String(p.level.dimension) + ' -> spookDim: ' + spookDim(p.level))
    spookTestLog(spookDim(p.level) == 'dreamshift:dreamspace', 'still in dreamshift:dreamspace 10 s after the teleport')
    spookTestLog(q.isCompleted(SPOOK_TEST.ds05), 'Dreamspace quest completed on arrival')
    p.teleportTo('minecraft:overworld', -148.5, 64, -26.5, 180, 0)
  })
  // 9. An instanced dreamspace (Paragraph Aisle, the library) should complete its own quest.
  let dreamTask = null
  Object.keys(global.SPOOK_QUEST_DATA.customTasks).forEach(t => { if (global.SPOOK_QUEST_DATA.customTasks[t] == 'dream:paragraph_aisle') dreamTask = t })
  step(3200, 'slip go', () => {
    let usage = []
    let d = server.commands.dispatcher
    d.root.children.forEach(n => {
      if (String(n.name) != 'dreamshift') return
      let all = d.getAllUsage(n, server.createCommandSourceStack(), true)
      for (var i = 0; i < all.length; i++) usage.push('/dreamshift ' + all[i])
    })
    console.info('[QuestAutoTest] dreamshift commands: ' + usage.join(' | '))
    let r = server.runCommand('execute as ' + name + ' at @s run dreamshift slip dreamshift:paragraph_aisle')
    console.info('[QuestAutoTest] dreamshift slip dreamshift:paragraph_aisle -> ' + r)
  })
  // a dreamspace visited for the first time is installed first, so the slip can take a while: poll for 30 s
  let slipDone = false
  spookTimes(15, i => step(3240 + i * 40, 'slip check', () => {
    if (slipDone) return
    let inside = spookDim(p.level).indexOf('paragraph_aisle') >= 0
    if (!inside && i < 14) return
    slipDone = true
    console.info('[QuestAutoTest] now in ' + spookDim(p.level) + ' after ' + (2 + i * 2) + ' s')
    spookTestLog(inside, 'slipped into Paragraph Aisle')
    server.scheduleInTicks(40, () => {
      spookTestLog(dreamTask != null && q.isCompleted(dreamTask), 'Paragraph Aisle quest completed on arrival')
      server.runCommandSilent('execute as ' + name + ' run dreamshift return')
    })
  }))
  step(3900, 'gate', () => {
    if (spookDim(p.level) != 'minecraft:overworld') p.teleportTo('minecraft:overworld', -148.5, 64, -26.5, 180, 0)
    // every Charter was registered in step 3, but the Cathedral's earlier quests were never done
    let fan = global.SPOOK_QUEST_DATA.fanfare, cathedral = null
    Object.keys(fan).forEach(id => { if (fan[id].indexOf('cathedral') >= 0) cathedral = id })
    spookTestLog(cathedral != null && !q.isCompleted(cathedral), 'Cathedral quest stays incomplete while its earlier quests are not done')
  })
  // 10. Mega Torch: ordinary hostiles are blocked near it, the Archive's horror mobs are not.
  step(3950, 'torch place', () => {
    server.runCommandSilent('setblock -140 64 -20 torchmaster:megatorch')
    ;['minecraft:zombie', 'minecraft:skeleton', 'cave_dweller:cave_dweller', 'the_knocker:knocker', 'weeping_angels:weeping_angel', 'graveyard:ghoul']
      .forEach(t => {
        let r = server.runCommand('summon ' + t + ' -148.5 64 -18.5 {NoAI:1b,Silent:1b,PersistenceRequired:1b,Tags:["spooktorch"]}')
        console.info('[QuestAutoTest] summon ' + t + ' -> ' + r)
      })
  })
  step(3955, 'torch check', () => {
    let H = Java.loadClass('net.xalcon.torchmaster.common.logic.entityblocking.EntityBlockingEventHandler')
    let pos = new SpookBlockPos(-148, 64, -18)
    let horror = ['cave_dweller:cave_dweller', 'the_knocker:knocker', 'weeping_angels:weeping_angel', 'graveyard:ghoul']
    p.level.getEntitiesWithin(AABB.of(-160, 54, -30, -136, 80, -6)).forEach(e => {
      let t = String(e.type)
      if (!e.tags.contains('spooktorch')) return
      let blocked = H.shouldBlockEntity(e, pos)
      let want = horror.indexOf(t) < 0
      spookTestLog(blocked == want, 'Mega Torch ' + (blocked ? 'blocks ' : 'allows ') + t)
    })
    server.runCommandSilent('kill @e[tag=spooktorch]')
    server.runCommandSilent('setblock -140 64 -20 minecraft:air')
  })
  step(4100, 'done', () => {
    server.runCommandSilent('forceload remove all')
    server.runCommandSilent('setblock -149 74 -6 minecraft:air')
    let old = []
    spookCharters(server).getAllKeys().forEach(k => old.push(String(k)))
    old.forEach(k => spookCharters(server).remove(k))
    console.info('[QuestAutoTest] finished')
    if (cfg.slipCommands) spookTestSlips(server, name, cfg.slipCommands)
  })
})

// Slippage screenshots: run the configured commands as the player, near the Scarecrow.
function spookTestSlips(server, name, cmds) {
  // cmds is a Java list from JsonIO: copy it and count by hand (its forEach gives no index)
  let list = []
  if (cmds) cmds.forEach(c => list.push(String(c)))
  spookTimes(list.length, i => server.scheduleInTicks(40 + i * 20, () => {
    let r = server.runCommand('execute as ' + name + ' at @s run ' + list[i])
    console.info('[QuestAutoTest] slip command "' + list[i] + '" -> ' + r)
  }))
}
