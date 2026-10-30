// Tooltips for the quest rework items.
ItemEvents.tooltip(event => {
  Object.keys(global.SPOOK_RIBBONS || {}).forEach(key => {
    event.add('spooktacular:ribbon_' + key, [
      Text.gold('Awarded to the winner of ' + global.SPOOK_RIBBONS[key] + '.'),
      Text.gray('Hand it in at that event\'s quest in Chapter 2 for a Winner\'s Bag.')
    ])
  })
  Object.keys(global.SPOOK_CHARTERS || {}).forEach(key => {
    event.add('spooktacular:charter_' + key, [
      Text.gray('Place on the middle of the front path, facing the door.'),
      Text.gray('Right-click: how close the build is. Sneak + right-click: show wrong blocks.')
    ])
  })
})
