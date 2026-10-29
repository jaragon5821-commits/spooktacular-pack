// priority: -20
// TEST BRANCH ONLY: writes a quest-rework self check to kubejs/logs/server.log when a world loads.
// Remove before the release goes to main.
ServerEvents.loaded(event => {
  try {
    let Registries = Java.loadClass('net.minecraft.core.registries.BuiltInRegistries')
    let RL = Java.loadClass('net.minecraft.resources.ResourceLocation')
    let spaces = ['alexscaves', 'boiled_reimagined', 'cave_dweller', 'corner_entity', 'cryptid_vx', 'darkdoppelganger',
      'distantfriends', 'eldritch_end', 'eyesinthedarkness', 'graveyard', 'krampus_vx', 'nyctophobia', 'palewatcher',
      'rootoffear', 'skarrier_mobs', 'the_knocker', 'the_obsessed', 'the_one_who_watches', 'undergarden', 'watching',
      'weeping_angels', 'whisperwoods']
    let found = []
    Registries.ENTITY_TYPE.keySet().forEach(k => { if (spaces.indexOf(String(k.namespace)) >= 0) found.push(String(k)) })
    console.info('[QuestSelfTest] entities: ' + found.sort().join(' '))
    let all = []
    Registries.ENTITY_TYPE.keySet().forEach(k => all.push(String(k)))
    console.info('[QuestSelfTest] all entities (' + all.length + '): ' + all.sort().join(' '))
    let missing = []
    Object.keys(global.SPOOK_QUEST_DATA.archive).forEach(id => {
      if (!event.server.advancements.getAdvancement(new RL(id))) missing.push(id)
    })
    console.info('[QuestSelfTest] archive advancements missing: ' + (missing.length ? missing.join(' ') : 'none'))
    let bad = []
    Object.keys(global.SPOOK_CHARTERS).forEach(key => { if (!spookBlueprint(key)) bad.push(key) })
    console.info('[QuestSelfTest] blueprints missing: ' + (bad.length ? bad.join(' ') : 'none'))
    console.info('[QuestSelfTest] custom tasks: ' + Object.keys(global.SPOOK_QUEST_DATA.customTasks).length +
      ', ribbon item: ' + Item.exists('spooktacular:festival_ribbon') + ', charter item: ' + Item.exists('spooktacular:charter_scarecrow'))
    let dims = []
    event.server.levelKeys().forEach(k => dims.push(String(k.location())))
    console.info('[QuestSelfTest] dimensions: ' + dims.join(' '))
  } catch (e) {
    console.error('[QuestSelfTest] failed: ' + e)
  }
})
