# Chop's Spooktacular changelog

Versions are `YYYY.MM.DD-N`: the date of the release and its number that day. Every change that
is pushed to the pack gets a new version, an entry here, and (after Chop approves the wording)
a post in #modpack-updates. "Players" is what gets posted; "Behind the scenes" is for reference.

## 2026.10.28-3

Players
- Fixed chests, signs and other block entities floating off their spot and turning at odd
  angles when shaders are on. RenderScale is back on the version from before today's update.
  If you still see it, set RenderScale to 100% in Video Settings and tell Josh.

Behind the scenes
- RenderScale 2.0.0-beta.1 (added in 2026.10.28-1) resizes and replaces Oculus' depth targets;
  with a render scale below 100% and Hysteria on, block entities drew offset and rotated away
  from their hitboxes. Confirmed by Chop (100% fixes it). Rolled back to 1.4.0-alpha.6, which
  ran without the problem through 2026.10.27.

## 2026.10.28-2

Players
- The Forgematica Printer is back: load a schematic in Forgematica and it places the blocks for
  you as you walk by. The crash it used to cause while printing is fixed.
- Known issue: the printer can still place directional blocks (stairs, chairs, doors, trapdoors,
  logs and similar) facing the wrong way. Place those and interactive blocks by hand first, then
  let the printer do the rest. If it ever crashes, turn it off and send Josh the crash report.

Behind the scenes
- Forgematica Printer 0.1.0 (client only) is the last release and called a Java 21-only method
  (`List.getFirst()`), so it crashed on the pack's Java 17 whenever it placed a block next to an
  interactive block. The pack ships a copy with that one call patched to `List.get(0)`; source,
  upstream links and the patch are in `patched-jars/`. Wrong-facing blocks are upstream issue #5
  (the printer doesn't turn the player before placing), not fixed.

## 2026.10.28-1 (major update)

Players
- Dream tears are back: cracks in walls show the dreamspace behind them. Walk in quickly; they
  close after about 30 seconds. If you ever get stuck inside blocks, the server lifts you out.
- FTB Chunks: open the map, go to Claimed Chunks, click to claim your base. Shift-click a claimed
  chunk to keep it loaded while you're away.
- Quality of life: Better Advancements and Advancement Plaques, Jade Addons, BetterF3,
  durability warnings and tooltips, item borders, pick-up notifications, stack refill, crafting
  tweaks, double doors, totems work from anywhere in your inventory, enchantment descriptions,
  Just Enough Professions, ping in the player list, Sophisticated Sorter, a paper doll.
- Performance: Radium replaces Canary, faster leaf rendering, RenderScale 2.0, fewer portal views
  drawn at once near dream tears.
- Quests: "Craft Any Botany Pot" now completes.

Behind the scenes
- Tested on the test branch as 2026.10.27-test1 to 2026.10.28-test6 (spark run, in-game checks,
  dedicated-server rehearsal). Results in Major Update Test Results\Run 3.
- Added 36 mods (full list in the Run 3 release notes draft), removed Canary, Chunk Sending,
  the four optional slow mods and leftover Canary/Open Parties and Claims files.
- New configs: Dreamshift (tears use Immersive Portals; same values as the server),
  Immersive Portals client (portal layers 2, no internet check), Carry On blacklist,
  Better Compatibility Checker version, ModernFix mixins, Structure Essentials.
- Quest fix: chapter 6 task 468F42F800C3DAF8 filters on botanypots:all_botany_pots.
- Server-only (already live): Dreamshift IP tears on, spooktacular_unbury.js, ServerCore
  horror-mob list and lag safety net, spike-hunt spark profile, backup before the update.
- Known issues, to look at later: tears are invisible-looking slits with shaders from far away;
  Spooklementary sky in dreamspaces and lit Nether portals with shaders not yet checked.

## 2026.10.27-2

Players
- The "Keybinds and Essential Hotkeys" quest now lists the real default keys: J for the map,
  M for Forgematica, hold ` for vein mining, R for the walkie-talkie and carriage harness, and
  the wardrobe button in your inventory for Cosmetic Armor. It also explains how to spot and fix
  key conflicts.

Behind the scenes
- Quest text edit in Before You Start (quest 271386B9E5F1CB59). Defaults checked in the mod jars.

## 2026.10.27-1 (first tracked release)

Players
- The pack is now called Chop's Spooktacular. Existing installs update as normal; the Prism
  instance keeps its old name until you rename it.
- Quest book cleanup: quests that mentioned mods not in the pack now describe what is
  actually in the game. No quest progress or rewards changed.

Behind the scenes
- `pack.toml` name changed; repository and update address unchanged.
- Quest text edits in Before You Start, Chapter 1 and Chapter 2.
- New friend zip: "Chop's Spooktacular - Prism instance.zip" (Google Drive, Exports).
- Server list description (MOTD) set to "Chop's Spooktacular".

## Before tracking (launch, 2026-10-25 to 2026-10-26)

Reconstructed from the commit history.

- 2026.10.26-8: quest WS08 teaches Easy Place on the Hallowstown blueprints.
- 2026.10.26-7: removed Forgematica Printer (crashed on Java 17).
- 2026.10.26-6: added the Hallowstown Forgematica and WorldEdit schematics.
- 2026.10.26-5: 28 mod updates (including Dreamshift 0.2.1); sleeping uses the vanilla 66% rule.
- 2026.10.26-4: added Better Days (30-minute days and nights), removed DarkSleep.
- 2026.10.26-3: removed the Apollyon quest (Q-DM17).
- 2026.10.26-2: quest rewrites and Chapter 7, Workshop Guides.
- Initial: pack moved from CurseForge to Prism + packwiz.
