// priority: -10
// Chop's Spooktacular quest rework: what happens when quests complete.
// - Town buildings: a short show over the building (themes approved by Josh, Oct 29). One pass, vanilla particles
//   and sounds only, nothing is left in the world. The Colossal Scarecrow gets fireworks plus a particle dome.
// - Archive: "Entity Found!" title and sound for the team when a creature is first photographed.
// - Milestones (Safari, Dreamspaces): completed here as a backup when enough of their quests are done.
// - /ribbon <player>: hosts hand an event winner a Festival Ribbon.
// Uses spookCharters / spookBlueprint / spookRotate from spooktacular_quests_charters.js.

const SPOOK_ORANGE = 16744448, SPOOK_PURPLE = 8388736, SPOOK_BLACK = 1973019

// Where to put a building's show: the middle of its blueprint, turned the way its Charter faces.
function spookShowSpot(server, key) {
  let c = spookCharters(server).getCompound(key)
  if (!c || !c.contains('x')) return null
  let bp = spookBlueprint(key)
  let minX = 0, maxX = 0, minZ = 0, maxZ = 0, maxY = 8
  if (bp) bp.blocks.forEach(b => {
    if (b[0] < minX) minX = b[0]; if (b[0] > maxX) maxX = b[0]
    if (b[2] < minZ) minZ = b[2]; if (b[2] > maxZ) maxZ = b[2]
    if (b[1] > maxY) maxY = b[1]
  })
  let r = spookRotate((minX + maxX) / 2, (minZ + maxZ) / 2, c.getString('facing'))
  return {
    dim: c.getString('dim'), x: c.getInt('x') + r[0], y: c.getInt('y'), z: c.getInt('z') + r[1],
    top: maxY, w: Math.max(maxX - minX, maxZ - minZ) / 2 + 2
  }
}

function spookShow(server, s) {
  let pre = 'execute in ' + s.dim + ' run '
  let f = n => n.toFixed(2)
  return {
    p: (particle, x, y, z, spread, speed, count) => server.runCommandSilent(pre + 'particle ' + particle + ' ' + f(x) + ' ' + f(y) + ' ' + f(z) + ' ' + spread + ' ' + spread + ' ' + spread + ' ' + speed + ' ' + count + ' force'),
    snd: (sound, vol, pitch) => server.runCommandSilent(pre + 'playsound ' + sound + ' master @a[x=' + f(s.x) + ',y=' + f(s.y) + ',z=' + f(s.z) + ',distance=..128] ' + f(s.x) + ' ' + f(s.y) + ' ' + f(s.z) + ' ' + vol + ' ' + pitch),
    firework: (x, y, z, colors, type) => server.runCommandSilent(pre + 'summon firework_rocket ' + f(x) + ' ' + f(y) + ' ' + f(z) +
      ' {LifeTime:' + (18 + Math.floor(Math.random() * 10)) + ',FireworksItem:{id:"firework_rocket",Count:1b,tag:{Fireworks:{Explosions:[{Type:' + (type || 0) +
      ',Flicker:1b,Trail:1b,Colors:[I;' + colors.join(',') + '],FadeColors:[I;' + SPOOK_BLACK + ']}]}}}}'),
    later: (ticks, fn) => server.scheduleInTicks(ticks, () => { try { fn() } catch (e) { console.error('[Fanfare] ' + e) } })
  }
}

// Standard burst: a handful of orange and purple rockets launched from above the roof (out of reach of players).
function spookFireworks(show, s, n) {
  for (let i = 0; i < n; i++) {
    show.later(i * 6, () => {
      let a = Math.random() * Math.PI * 2, r = Math.random() * s.w * 0.6
      show.firework(s.x + Math.cos(a) * r, s.y + s.top + 4, s.z + Math.sin(a) * r, [i % 2 ? SPOOK_PURPLE : SPOOK_ORANGE], i % 3 == 0 ? 1 : 4)
    })
  }
}

function spookRing(show, x, y, z, radius, particle, points) {
  for (let i = 0; i < points; i++) {
    let a = i / points * Math.PI * 2
    show.p(particle, x + Math.cos(a) * radius, y, z + Math.sin(a) * radius, 0, 0, 1)
  }
}

const SPOOK_THEMES = {
  scarecrow: (show, s) => {
    for (let i = 0; i < 12; i++) show.later(i * 4, () => {
      let a = i / 12 * Math.PI * 2
      show.firework(s.x + Math.cos(a) * 14, s.y + 20, s.z + Math.sin(a) * 14, [i % 2 ? SPOOK_PURPLE : SPOOK_ORANGE], i % 4 == 0 ? 1 : 0)
    })
    // The dome: rings climb from the edge of town (radius 48) up and over the top in about 4 seconds.
    let R = 48
    for (let k = 0; k <= 20; k++) show.later(50 + k * 4, () => {
      let theta = k / 20 * Math.PI / 2
      let r = Math.max(1, R * Math.cos(theta)), h = R * Math.sin(theta)
      let pts = Math.max(8, Math.round(r * 1.6))
      spookRing(show, s.x, s.y + h, s.z, r, k % 2 ? 'minecraft:dust 0.55 0.1 0.8 3' : 'minecraft:dust 1 0.5 0 3', pts)
    })
    show.later(50, () => show.snd('minecraft:block.beacon.activate', 4, 0.6))
    show.later(130, () => show.snd('minecraft:block.beacon.power_select', 4, 0.8))
  },
  tavern: (show, s) => {
    for (let i = 0; i < 8; i++) show.later(i * 5, () => show.p('minecraft:note', s.x, s.y + s.top + 1, s.z, 2, 1, 6))
    spookFireworks(show, s, 4)
    show.later(10, () => show.snd('minecraft:entity.villager.celebrate', 3, 1))
    show.later(25, () => show.snd('minecraft:entity.villager.yes', 3, 1.2))
  },
  cemetery: (show, s) => {
    show.p('minecraft:cloud', s.x, s.y + 0.5, s.z, s.w * 0.6, 0.01, 200)
    for (let i = 0; i < 10; i++) show.later(i * 6, () => show.p('minecraft:soul', s.x, s.y + 1, s.z, s.w * 0.5, 0.03, 40))
    show.later(5, () => show.snd('minecraft:block.bell.use', 4, 0.6))
  },
  crypt: (show, s) => {
    for (let i = 0; i < 10; i++) show.later(i * 4, () => {
      show.p('minecraft:soul_fire_flame', s.x - s.w + i * s.w / 5, s.y + 0.2, s.z, 0.3, 0.01, 10)
      show.p('minecraft:soul_fire_flame', s.x, s.y + 0.2, s.z - s.w + i * s.w / 5, 0.3, 0.01, 10)
    })
    show.snd('minecraft:entity.warden.ambient', 3, 0.5)
    for (let i = 0; i < 4; i++) show.later(i * 8, () => show.snd('minecraft:entity.skeleton.ambient', 2, 0.7 + i * 0.1))
  },
  apothecary: (show, s) => {
    for (let i = 0; i < 10; i++) show.later(i * 5, () => {
      show.p('minecraft:witch', s.x, s.y + s.top, s.z, 2, 0.1, 30)
      show.p('minecraft:dust 0.3 0.9 0.2 1.5', s.x, s.y + s.top, s.z, 2.5, 0, 20)
    })
    for (let i = 0; i < 3; i++) show.later(i * 12, () => show.snd('minecraft:entity.parrot.ambient', 3, 0.5))
    show.snd('minecraft:block.brewing_stand.brew', 3, 0.8)
  },
  archive: (show, s) => {
    show.p('minecraft:flash', s.x, s.y + s.top / 2, s.z, 0, 0, 1)
    show.p('minecraft:end_rod', s.x, s.y + s.top / 2, s.z, 0.5, 0.6, 120)
    for (let i = 0; i < 3; i++) show.later(i * 3, () => show.snd('minecraft:ui.button.click', 3, 1.6))
  },
  spire: (show, s) => {
    for (let i = 0; i < 12; i++) show.later(i * 10, () => {
      show.snd('minecraft:block.bell.use', 4, 0.7)
      spookRing(show, s.x, s.y + s.top, s.z, 3 + i * 2.5, 'minecraft:end_rod', 24 + i * 4)
    })
  },
  wharf: (show, s) => {
    for (let i = 0; i < 8; i++) show.later(i * 4, () => {
      show.p('minecraft:cloud', s.x, s.y + i, s.z, s.w * 0.5, 0.01, 60)
      show.p('minecraft:splash', s.x, s.y + 1, s.z, s.w * 0.5, 0.2, 80)
    })
    show.snd('minecraft:item.goat_horn.sound.0', 4, 0.8)
  },
  cathedral: (show, s) => {
    for (let i = 0; i < 16; i++) show.later(i * 3, () => {
      show.p('minecraft:end_rod', s.x - s.w * 0.6, s.y + i * 2, s.z, 0.3, 0, 8)
      show.p('minecraft:end_rod', s.x + s.w * 0.6, s.y + i * 2, s.z, 0.3, 0, 8)
      show.p('minecraft:dust 1 0.85 0.3 2', s.x, s.y + i * 2.5, s.z, 1, 0, 10)
    })
    ;[0.5, 0.63, 0.75].forEach(p => show.snd('minecraft:block.note_block.chime', 3, p))
    show.later(30, () => show.snd('minecraft:block.bell.use', 4, 0.8))
  },
  citadel: (show, s) => {
    for (let i = 0; i < 12; i++) show.later(i * 4, () => {
      show.p('minecraft:lava', s.x, s.y + 2, s.z, s.w * 0.4, 0, 20)
      show.p('minecraft:flame', s.x, s.y + 2 + i, s.z, 1, 0.05, 30)
      show.p('minecraft:crimson_spore', s.x, s.y + s.top / 2, s.z, s.w * 0.5, 0, 60)
    })
    show.later(20, () => show.snd('minecraft:entity.ghast.ambient', 3, 0.7))
  },
  observatory: (show, s) => {
    for (let i = 0; i < 40; i++) show.later(i, () => {
      let a = i / 40 * Math.PI * 6
      show.p('minecraft:end_rod', s.x + Math.cos(a) * 5, s.y + s.top + i * 0.6, s.z + Math.sin(a) * 5, 0.1, 0, 3)
      show.p('minecraft:portal', s.x, s.y + s.top, s.z, 3, 0.5, 20)
    })
    show.snd('minecraft:block.amethyst_block.chime', 4, 0.5)
    show.later(30, () => show.snd('minecraft:block.end_portal.spawn', 1, 1.2))
  },
  hall_of_heroes: (show, s) => {
    for (let i = 0; i < 10; i++) show.later(i * 4, () => show.p('minecraft:totem_of_undying', s.x, s.y + s.top, s.z, 3, 0.6, 60))
    spookFireworks(show, s, 8)
    show.snd('minecraft:ui.toast.challenge_complete', 4, 1)
  }
}
SPOOK_THEMES.catacombs = SPOOK_THEMES.crypt

function spookFanfare(server, key, name) {
  let s = spookShowSpot(server, key)
  if (!s) return
  let show = spookShow(server, s)
  let theme = SPOOK_THEMES[key]
  if (theme) theme(show, s)
  else { spookFireworks(show, s, 5); show.snd('minecraft:entity.player.levelup', 3, 0.8) }
  let title = key == 'scarecrow' ? 'Hallowstown stands watch' : name + ' is open'
  server.runCommandSilent('execute in ' + s.dim + ' run title @a[x=' + s.x + ',y=' + s.y + ',z=' + s.z + ',distance=..128] subtitle {"text":"' + title + '","color":"gold"}')
  server.runCommandSilent('execute in ' + s.dim + ' run title @a[x=' + s.x + ',y=' + s.y + ',z=' + s.z + ',distance=..128] title {"text":" "}')
}

Object.keys(global.SPOOK_QUEST_DATA.fanfare).forEach(questId => {
  FTBQuestsEvents.completed(questId, event => {
    global.SPOOK_QUEST_DATA.fanfare[questId].forEach((key, i) => {
      event.server.scheduleInTicks(1 + i * 140, () => spookFanfare(event.server, key, global.SPOOK_CHARTERS[key]))
    })
  })
})

// Archive: a creature's first photo.
FTBQuestsEvents.completed('#entity_found', event => {
  let name = global.SPOOK_QUEST_DATA.entityNames[String(event.object)] || 'Unknown'
  event.onlineMembers.forEach(p => {
    let u = p.username
    event.server.runCommandSilent('title ' + u + ' times 10 70 20')
    event.server.runCommandSilent('title ' + u + ' subtitle {"text":"' + name.replace(/"/g, '\\"') + '","color":"gray","italic":true}')
    event.server.runCommandSilent('title ' + u + ' title {"text":"Entity Found!","color":"dark_red","bold":true}')
    event.server.runCommandSilent('playsound minecraft:ui.toast.challenge_complete master ' + u + ' ~ ~ ~ 0.8 0.7')
    event.server.runCommandSilent('playsound minecraft:ambient.cave master ' + u + ' ~ ~ ~ 1 0.8')
  })
})

// Milestones complete once enough of their quests are done. FTB Quests normally does this itself for a quest
// with no tasks; this makes sure it also happens for progress made before the update.
function spookCheckMilestones(data) {
  let ms = global.SPOOK_QUEST_DATA.milestones
  Object.keys(ms).forEach(id => {
    if (data.isCompleted(id)) return
    let need = ms[id][0], have = 0
    ms[id][1].forEach(dep => { if (data.isCompleted(dep)) have++ })
    if (have >= need) data.complete(id)
  })
}
FTBQuestsEvents.completed(event => {
  try { spookCheckMilestones(event.data) } catch (e) { console.error('[Milestones] ' + e) }
})
PlayerEvents.loggedIn(event => {
  event.server.scheduleInTicks(100, () => {
    try { spookCheckMilestones(event.player.data.ftbquests) } catch (e) { console.error('[Milestones] ' + e) }
  })
})

// /ribbon <player>: give the winner of an event a Festival Ribbon (hand it in at the event's quest).
ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event
  event.register(Commands.literal('ribbon')
    .requires(src => src.hasPermission(2))
    .then(Commands.argument('player', Arguments.PLAYER.create(event))
      .executes(ctx => {
        let player = Arguments.PLAYER.getResult(ctx, 'player')
        player.give(Item.of('spooktacular:festival_ribbon'))
        ctx.source.server.runCommandSilent('tellraw @a ["",{"text":"🎀 ","color":"gold"},{"text":"' + player.username + ' won a Festival Ribbon!","color":"gold","bold":true}]')
        ctx.source.server.runCommandSilent('playsound minecraft:ui.toast.challenge_complete master @a ~ ~ ~ 0.6 1.2')
        return 1
      })))
})
