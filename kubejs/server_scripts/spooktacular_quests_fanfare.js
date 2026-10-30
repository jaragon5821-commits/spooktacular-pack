// priority: -10
// Chop's Spooktacular quest rework: what happens when quests complete.
// - Town buildings: a short show over the building (themes approved by Josh, Oct 29). One pass, vanilla particles
//   and sounds only, nothing is left in the world. The Colossal Scarecrow gets fireworks plus a particle dome.
// - Archive: "Entity Found!" title and sound for the team when a creature is first photographed.
// - Milestones (Safari, Dreamspaces): completed here as a backup when enough of their quests are done.
// - /ribbon <player> <event>: hosts hand an event winner that event's Festival Ribbon.
// Uses spookCharters / spookBlueprint / spookRotate from spooktacular_quests_charters.js.

// Rhino gives every pass of a `for (let ...)` loop the same variable, so closures made inside one all see
// the last value. spookTimes(n, i => ...) gives each pass its own i.
function spookTimes(n, fn) { for (var j = 0; j < n; j++) fn(j) }

// Trig and random numbers came out as NaN inside KubeJS here, so the shows use plain tables instead.
// SPOOK_CIRCLE: 72 points around a circle [cos, sin]. SPOOK_SPHERE: 48 points spread over a sphere [x, y, z].
const SPOOK_CIRCLE = [[1.0000,0.0000],[0.9962,0.0872],[0.9848,0.1736],[0.9659,0.2588],[0.9397,0.3420],[0.9063,0.4226],[0.8660,0.5000],[0.8192,0.5736],[0.7660,0.6428],[0.7071,0.7071],[0.6428,0.7660],[0.5736,0.8192],[0.5000,0.8660],[0.4226,0.9063],[0.3420,0.9397],[0.2588,0.9659],[0.1736,0.9848],[0.0872,0.9962],[0.0000,1.0000],[-0.0872,0.9962],[-0.1736,0.9848],[-0.2588,0.9659],[-0.3420,0.9397],[-0.4226,0.9063],[-0.5000,0.8660],[-0.5736,0.8192],[-0.6428,0.7660],[-0.7071,0.7071],[-0.7660,0.6428],[-0.8192,0.5736],[-0.8660,0.5000],[-0.9063,0.4226],[-0.9397,0.3420],[-0.9659,0.2588],[-0.9848,0.1736],[-0.9962,0.0872],[-1.0000,0.0000],[-0.9962,-0.0872],[-0.9848,-0.1736],[-0.9659,-0.2588],[-0.9397,-0.3420],[-0.9063,-0.4226],[-0.8660,-0.5000],[-0.8192,-0.5736],[-0.7660,-0.6428],[-0.7071,-0.7071],[-0.6428,-0.7660],[-0.5736,-0.8192],[-0.5000,-0.8660],[-0.4226,-0.9063],[-0.3420,-0.9397],[-0.2588,-0.9659],[-0.1736,-0.9848],[-0.0872,-0.9962],[-0.0000,-1.0000],[0.0872,-0.9962],[0.1736,-0.9848],[0.2588,-0.9659],[0.3420,-0.9397],[0.4226,-0.9063],[0.5000,-0.8660],[0.5736,-0.8192],[0.6428,-0.7660],[0.7071,-0.7071],[0.7660,-0.6428],[0.8192,-0.5736],[0.8660,-0.5000],[0.9063,-0.4226],[0.9397,-0.3420],[0.9659,-0.2588],[0.9848,-0.1736],[0.9962,-0.0872]]
const SPOOK_SPHERE = [[0.203,0.979,0.000],[-0.257,0.938,-0.235],[0.039,0.896,0.443],[0.316,0.854,-0.413],[-0.574,0.812,0.102],[0.538,0.771,0.342],[-0.178,0.729,-0.661],[-0.335,0.688,0.644],[0.717,0.646,-0.262],[-0.737,0.604,-0.304],[0.350,0.562,0.749],[0.255,0.521,-0.815],[-0.759,0.479,0.440],[0.878,0.437,0.193],[-0.528,0.396,-0.751],[-0.120,0.354,0.927],[0.726,0.312,-0.612],[-0.962,0.271,-0.040],[0.690,0.229,0.687],[-0.045,0.187,-0.981],[-0.634,0.146,0.760],[0.986,0.104,-0.133],[-0.819,0.062,-0.570],[0.219,0.021,0.975],[0.497,-0.021,-0.867],[-0.951,-0.063,0.303],[0.903,-0.104,0.417],[-0.382,-0.146,-0.913],[-0.332,-0.188,0.924],[0.862,-0.229,-0.453],[-0.931,-0.271,-0.245],[0.514,-0.312,0.799],[0.158,-0.354,-0.922],[-0.726,-0.396,0.562],[0.896,-0.438,0.074],[-0.596,-0.479,-0.644],[0.004,-0.521,0.854],[0.556,-0.562,-0.612],[-0.793,-0.604,0.074],[0.608,-0.646,0.462],[-0.130,-0.688,-0.714],[-0.364,-0.729,0.579],[0.614,-0.771,-0.168],[-0.519,-0.812,-0.266],[0.181,-0.854,0.488],[0.168,-0.896,-0.412],[-0.314,-0.938,0.149],[0.194,-0.979,0.060]]
// point on a circle, `turns` = 0..1 around it
function spookCS(turns) {
  let i = ((turns * 72) % 72 + 72) % 72
  return SPOOK_CIRCLE[i - (i % 1)]
}
let spookSeed = 20261031
function spookRand() {
  spookSeed = (spookSeed * 16807) % 2147483647
  return spookSeed / 2147483647
}

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

// Runs a show command. While global.spookFanfareDebug > 0 (set by the test script), the next commands are run
// loudly and logged with their result.
function spookRun(server, command) {
  if (global.spookFanfareDebug > 0) {
    global.spookFanfareDebug--
    let r = server.runCommand(command)
    console.info('[Fanfare] ' + r + ' <- ' + command)
    return r
  }
  return server.runCommandSilent(command)
}

function spookShow(server, s) {
  let pre = 'execute in ' + s.dim + ' run '
  let f = n => Number(n).toFixed(2)
  console.info('[Fanfare] show at ' + s.dim + ' ' + s.x + ' ' + s.y + ' ' + s.z + ' top ' + s.top + ' w ' + s.w)
  return {
    p: (particle, x, y, z, spread, speed, count) => spookRun(server, pre + 'particle ' + particle + ' ' + f(x) + ' ' + f(y) + ' ' + f(z) + ' ' + spread + ' ' + spread + ' ' + spread + ' ' + speed + ' ' + count + ' force'),
    snd: (sound, vol, pitch) => server.runCommandSilent(pre + 'playsound ' + sound + ' master @a[x=' + f(s.x) + ',y=' + f(s.y) + ',z=' + f(s.z) + ',distance=..128] ' + f(s.x) + ' ' + f(s.y) + ' ' + f(s.z) + ' ' + vol + ' ' + pitch),
    // Fireworks drawn with particles and sounds only: a spark trail climbs, then a coloured burst. No rocket
    // entities (a spawned rocket hung the server in testing, and particles can't hurt anyone).
    firework: (x, y, z, colors, type) => {
      let c = colors[0], rgb = ((c >> 16) & 255) / 255 + ' ' + ((c >> 8) & 255) / 255 + ' ' + (c & 255) / 255
      let run = (ticks, fn) => server.scheduleInTicks(ticks, () => { try { fn() } catch (e) { console.error('[Fanfare] ' + e) } })
      let cmd = c2 => spookRun(server, pre + c2)
      cmd('playsound minecraft:entity.firework_rocket.launch master @a[x=' + f(x) + ',y=' + f(y) + ',z=' + f(z) + ',distance=..160] ' + f(x) + ' ' + f(y) + ' ' + f(z) + ' 3 1')
      spookTimes(8, j => run(j, () => cmd('particle minecraft:firework ' + f(x) + ' ' + f(y + j * 2) + ' ' + f(z) + ' 0.05 0.1 0.05 0 3 force')))
      run(10, () => {
        let top = y + 16, big = type == 1 ? 7 : 4
        spookTimes(48, k => {
          let d = SPOOK_SPHERE[k]
          cmd('particle minecraft:dust ' + rgb + ' 3 ' + f(x + big * d[0]) + ' ' + f(top + big * d[1]) + ' ' + f(z + big * d[2]) + ' 0.2 0.2 0.2 0 2 force')
        })
        cmd('particle minecraft:firework ' + f(x) + ' ' + f(top) + ' ' + f(z) + ' ' + big / 3 + ' ' + big / 3 + ' ' + big / 3 + ' 0.1 60 force')
        cmd('particle minecraft:end_rod ' + f(x) + ' ' + f(top) + ' ' + f(z) + ' 0 0 0 0.25 30 force')
        cmd('playsound minecraft:entity.firework_rocket.' + (type == 1 ? 'large_blast' : 'blast') + ' master @a[x=' + f(x) + ',y=' + f(top) + ',z=' + f(z) + ',distance=..200] ' + f(x) + ' ' + f(top) + ' ' + f(z) + ' 4 1')
        run(12, () => cmd('playsound minecraft:entity.firework_rocket.twinkle master @a[x=' + f(x) + ',y=' + f(top) + ',z=' + f(z) + ',distance=..200] ' + f(x) + ' ' + f(top) + ' ' + f(z) + ' 3 1'))
      })
    },
    later: (ticks, fn) => server.scheduleInTicks(ticks, () => { try { fn() } catch (e) { console.error('[Fanfare] ' + e) } })
  }
}

// Standard burst: a handful of orange and purple rockets launched from above the roof (out of reach of players).
function spookFireworks(show, s, n) {
  spookTimes(n, i => {
    show.later(i * 6, () => {
      let d = spookCS(spookRand()), r = spookRand() * s.w * 0.6
      show.firework(s.x + d[0] * r, s.y + s.top + 4, s.z + d[1] * r, [i % 2 ? SPOOK_PURPLE : SPOOK_ORANGE], i % 3 == 0 ? 1 : 4)
    })
  })
}

function spookRing(show, x, y, z, radius, particle, points) {
  spookTimes(points, i => {
    let d = spookCS(i / points)
    show.p(particle, x + d[0] * radius, y, z + d[1] * radius, 0, 0, 1)
  })
}

const SPOOK_THEMES = {
  scarecrow: (show, s) => {
    spookTimes(12, i => show.later(i * 4, () => {
      let d = spookCS(i / 12)
      show.firework(s.x + d[0] * 14, s.y + 20, s.z + d[1] * 14, [i % 2 ? SPOOK_PURPLE : SPOOK_ORANGE], i % 4 == 0 ? 1 : 0)
    }))
    // The dome: rings climb from the edge of town (radius 48) up and over the top in about 4 seconds.
    let R = 48
    spookTimes(21, k => show.later(50 + k * 4, () => {
      let d = spookCS(k / 80)          // a quarter turn over the 20 steps
      let r = Math.max(1, R * d[0]), h = R * d[1]
      let pts = Math.max(12, Math.floor(r * 3))
      spookRing(show, s.x, s.y + h, s.z, r, k % 2 ? 'minecraft:dust 0.75 0.25 1 4' : 'minecraft:dust 1 0.55 0 4', pts)
    }))
    show.later(50, () => show.snd('minecraft:block.beacon.activate', 4, 0.6))
    show.later(130, () => show.snd('minecraft:block.beacon.power_select', 4, 0.8))
  },
  tavern: (show, s) => {
    spookTimes(8, i => show.later(i * 5, () => show.p('minecraft:note', s.x, s.y + s.top + 1, s.z, 2, 1, 6)))
    spookFireworks(show, s, 4)
    show.later(10, () => show.snd('minecraft:entity.villager.celebrate', 3, 1))
    show.later(25, () => show.snd('minecraft:entity.villager.yes', 3, 1.2))
  },
  cemetery: (show, s) => {
    show.p('minecraft:cloud', s.x, s.y + 0.5, s.z, s.w * 0.6, 0.01, 200)
    spookTimes(10, i => show.later(i * 6, () => show.p('minecraft:soul', s.x, s.y + 1, s.z, s.w * 0.5, 0.03, 40)))
    show.later(5, () => show.snd('minecraft:block.bell.use', 4, 0.6))
  },
  crypt: (show, s) => {
    spookTimes(10, i => show.later(i * 4, () => {
      show.p('minecraft:soul_fire_flame', s.x - s.w + i * s.w / 5, s.y + 0.2, s.z, 0.3, 0.01, 10)
      show.p('minecraft:soul_fire_flame', s.x, s.y + 0.2, s.z - s.w + i * s.w / 5, 0.3, 0.01, 10)
    }))
    show.snd('minecraft:entity.warden.ambient', 3, 0.5)
    spookTimes(4, i => show.later(i * 8, () => show.snd('minecraft:entity.skeleton.ambient', 2, 0.7 + i * 0.1)))
  },
  apothecary: (show, s) => {
    spookTimes(10, i => show.later(i * 5, () => {
      show.p('minecraft:witch', s.x, s.y + s.top, s.z, 2, 0.1, 30)
      show.p('minecraft:dust 0.3 0.9 0.2 1.5', s.x, s.y + s.top, s.z, 2.5, 0, 20)
    }))
    spookTimes(3, i => show.later(i * 12, () => show.snd('minecraft:entity.parrot.ambient', 3, 0.5)))
    show.snd('minecraft:block.brewing_stand.brew', 3, 0.8)
  },
  archive: (show, s) => {
    show.p('minecraft:flash', s.x, s.y + s.top / 2, s.z, 0, 0, 1)
    show.p('minecraft:end_rod', s.x, s.y + s.top / 2, s.z, 0.5, 0.6, 120)
    spookTimes(3, i => show.later(i * 3, () => show.snd('minecraft:ui.button.click', 3, 1.6)))
  },
  spire: (show, s) => {
    spookTimes(12, i => show.later(i * 10, () => {
      show.snd('minecraft:block.bell.use', 4, 0.7)
      spookRing(show, s.x, s.y + s.top, s.z, 3 + i * 2.5, 'minecraft:end_rod', 24 + i * 4)
    }))
  },
  wharf: (show, s) => {
    spookTimes(8, i => show.later(i * 4, () => {
      show.p('minecraft:cloud', s.x, s.y + i, s.z, s.w * 0.5, 0.01, 60)
      show.p('minecraft:splash', s.x, s.y + 1, s.z, s.w * 0.5, 0.2, 80)
    }))
    show.snd('minecraft:item.goat_horn.sound.0', 4, 0.8)
  },
  cathedral: (show, s) => {
    spookTimes(16, i => show.later(i * 3, () => {
      show.p('minecraft:end_rod', s.x - s.w * 0.6, s.y + i * 2, s.z, 0.3, 0, 8)
      show.p('minecraft:end_rod', s.x + s.w * 0.6, s.y + i * 2, s.z, 0.3, 0, 8)
      show.p('minecraft:dust 1 0.85 0.3 2', s.x, s.y + i * 2.5, s.z, 1, 0, 10)
    }))
    ;[0.5, 0.63, 0.75].forEach(p => show.snd('minecraft:block.note_block.chime', 3, p))
    show.later(30, () => show.snd('minecraft:block.bell.use', 4, 0.8))
  },
  citadel: (show, s) => {
    spookTimes(12, i => show.later(i * 4, () => {
      show.p('minecraft:lava', s.x, s.y + 2, s.z, s.w * 0.4, 0, 20)
      show.p('minecraft:flame', s.x, s.y + 2 + i, s.z, 1, 0.05, 30)
      show.p('minecraft:crimson_spore', s.x, s.y + s.top / 2, s.z, s.w * 0.5, 0, 60)
    }))
    show.later(20, () => show.snd('minecraft:entity.ghast.ambient', 3, 0.7))
  },
  observatory: (show, s) => {
    spookTimes(40, i => show.later(i, () => {
      let d = spookCS(i / 40 * 3)
      show.p('minecraft:end_rod', s.x + d[0] * 5, s.y + s.top + i * 0.6, s.z + d[1] * 5, 0.1, 0, 3)
      show.p('minecraft:portal', s.x, s.y + s.top, s.z, 3, 0.5, 20)
    }))
    show.snd('minecraft:block.amethyst_block.chime', 4, 0.5)
    show.later(30, () => show.snd('minecraft:block.end_portal.spawn', 1, 1.2))
  },
  hall_of_heroes: (show, s) => {
    spookTimes(10, i => show.later(i * 4, () => show.p('minecraft:totem_of_undying', s.x, s.y + s.top, s.z, 3, 0.6, 60)))
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

// /ribbon <player> <event>: give the winner of an event that event's Festival Ribbon (hand it in at the event's quest).
const SpookStringArg = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')
ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event
  let events = Object.keys(global.SPOOK_RIBBONS)
  event.register(Commands.literal('ribbon')
    .requires(src => src.hasPermission(2))
    .then(Commands.argument('player', Arguments.PLAYER.create(event))
      .executes(ctx => {
        ctx.source.sendFailure(Text.red('Name the event too: /ribbon <player> <event>. Events: ' + events.join(', ')))
        return 0
      })
      .then(Commands.argument('event', SpookStringArg.word())
        .suggests((ctx, builder) => {
          events.forEach(k => builder.suggest(k))
          return builder.buildFuture()
        })
        .executes(ctx => {
          let player = Arguments.PLAYER.getResult(ctx, 'player')
          let key = String(SpookStringArg.getString(ctx, 'event'))
          if (!global.SPOOK_RIBBONS[key]) {
            ctx.source.sendFailure(Text.red('Unknown event "' + key + '". Events: ' + events.join(', ')))
            return 0
          }
          let name = global.SPOOK_RIBBONS[key]
          player.give(Item.of('spooktacular:ribbon_' + key))
          ctx.source.server.runCommandSilent('tellraw @a ["",{"text":"\u2605 ","color":"gold"},{"text":"' + player.username + ' won ' + name + '!","color":"gold","bold":true}]')
          ctx.source.server.runCommandSilent('playsound minecraft:ui.toast.challenge_complete master @a ~ ~ ~ 0.6 1.2')
          return 1
        }))))
})
