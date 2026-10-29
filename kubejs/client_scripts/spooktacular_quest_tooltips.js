// Tooltips for the quest rework items.
ItemEvents.tooltip(event => {
  event.add('spooktacular:festival_ribbon', [
    Text.gold('Awarded to festival winners.'),
    Text.gray('Hand it in at the event\'s quest for a Winner\'s Bag.')
  ])
  Object.keys(global.SPOOK_CHARTERS || {}).forEach(key => {
    event.add('spooktacular:charter_' + key, [
      Text.gray('Place on the middle of the front path, facing the door.'),
      Text.gray('Right-click: how close the build is. Sneak + right-click: show wrong blocks.')
    ])
  })
})
